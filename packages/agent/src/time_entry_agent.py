from datetime import date
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from typing_extensions import Literal
import os

from api.client import TimeTrackingApiClient  # Fixed import path

load_dotenv()

base_url = os.environ.get("TIME_ENTRY_API_URL", "http://localhost:5008")


@tool
def get_projects():
    """
    Returns a list of mock time entry projects for a software consulting company.
    Each project includes client name, project name, and project ID.
    """
    client = TimeTrackingApiClient(base_url)
    projects = client.get_all_projects()
    return projects


@tool
def book_time_entry(clientName: str, projectName: str, projectId: str, date: str, hours: int):
    """
    Books a time entry for a given project.

    Args:
        clientName (str): The name of the client.
        projectName (str): The name of the project.
        projectId (str): The unique identifier for the project.
        date (str): The date for the time entry in ISO format (YYYY-MM-DD).
        hours (int): The number of hours to book.
    """
    client = TimeTrackingApiClient(base_url)
    entry = client.create_time_entry(projectId, 'user1234', date, hours)
    return entry


tools = [get_projects, book_time_entry]

model = ChatAnthropic(model="claude-3-7-sonnet-20250219").bind_tools(tools)

sys_msg = SystemMessage(content=f"""
    You are a helpful assistant tasked with helping Intertech employees track 
    time spent on projects. You may not help with anything else. Do no expose
    any information about IDs or other sensitive information.
    Use plain text only in responses. Don't try to use markdown or any other
    formatting.
    Today is {date.today().isoformat()}.
    """)


def assistant(state: MessagesState):
    return {"messages": [model.invoke([sys_msg] + state["messages"])]}


def human_review_node(state) -> Command[Literal["assistant", "tools"]]:
    last_message = state["messages"][-1]
    tool_call = last_message.tool_calls[-1]

    if tool_call["name"] == "get_projects":
        # If the tool call is for get_projects, we don't need to ask for human review
        return Command(goto="tools")

    args = tool_call["args"]

    # this is the value we'll be providing via Command(resume=<human_review>)
    human_review = interrupt(
        {
            "question": f"""
            Client: {args['clientName']}
            Project: {args['projectName']}
            Date: {args['date']}
            Hours: {args['hours']}
            Continue?
            """,
            # Surface tool calls for review
            "tool_call": tool_call,
        }
    )

    review_action = human_review["action"]
    review_data = human_review.get("data")

    # if approved, call the tool
    if review_action == "continue":
        return Command(goto="tools")

    # update the AI message AND call tools
    elif review_action == "update":
        updated_message = {
            "role": "ai",
            "content": last_message.content,
            "tool_calls": [
                {
                    "id": tool_call["id"],
                    "name": tool_call["name"],
                    # This the update provided by the human
                    "args": review_data,
                }
            ],
            # This is important - this needs to be the same as the message you replacing!
            # Otherwise, it will show up as a separate message
            "id": last_message.id,
        }
        return Command(goto="tools", update={"messages": [updated_message]})

    # provide feedback to LLM
    elif review_action == "feedback":
        # NOTE: we're adding feedback message as a ToolMessage
        # to preserve the correct order in the message history
        # (AI messages with tool calls need to be followed by tool call messages)
        tool_message = {
            "role": "tool",
            # This is our natural language feedback
            "content": review_data,
            "name": tool_call["name"],
            "tool_call_id": tool_call["id"],
        }
        return Command(goto="assistant", update={"messages": [tool_message]})


def route_after_llm(state) -> Literal[END, "human_review_node"]:
    if len(state["messages"][-1].tool_calls) == 0:
        return END
    else:
        return "human_review_node"


builder = StateGraph(MessagesState)
builder.add_node(assistant)
builder.add_node(ToolNode([get_projects, book_time_entry]))
builder.add_node(human_review_node)
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route_after_llm)
builder.add_edge("tools", "assistant")

# Add
graph = builder.compile()
