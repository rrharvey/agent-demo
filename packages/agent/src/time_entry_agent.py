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

from api.client import TimeTrackingApiClient

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
def book_time_entry(clientName: str, projectName: str, projectId: str, date: str, hours: float):
    """
    Books a time entry for a given project.

    Args: 
        clientName (str): The name of the client.
        projectName (str): The name of the project.
        projectId (str): The unique identifier for the project.
        date (float): The date for the time entry in ISO format (YYYY-MM-DD).
        hours (int): The number of hours to book rounded to the nearest quarter hour.
    """
    client = TimeTrackingApiClient(base_url)
    entry = client.create_time_entry(projectId, 'user1234', date, hours)
    return entry


tools = [get_projects, book_time_entry]

model = ChatAnthropic(model="claude-3-7-sonnet-20250219").bind_tools(tools)


def load_system_prompt():
    """Load the system prompt from a text file and format it with the current date."""
    prompt_path = os.path.join(os.path.dirname(__file__), "system_prompt.txt")
    with open(prompt_path, "r") as f:
        prompt_template = f.read()
    return prompt_template.format(date=date.today().isoformat())


sys_msg = SystemMessage(content=load_system_prompt())


def assistant(state: MessagesState):
    return {"messages": [model.invoke([sys_msg] + state["messages"])]}


def review(state) -> Command[Literal["assistant", "tools"]]:
    last_message = state["messages"][-1]
    tool_call = last_message.tool_calls[-1]

    if tool_call["name"] == "get_projects":
        # If the tool call is for get_projects, we don't need to ask for human review
        return Command(goto="tools")

    args = tool_call["args"]

    # this is the value we'll be providing via Command(resume=<human_review>)
    human_review = interrupt(
        {
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
        print("last_message:")
        print(last_message)
        updated_message = {
            "role": "ai",
            "content": last_message.content,
            "tool_calls": [
                {
                    "name": tool_call["name"],
                    "id": tool_call["id"],
                    "type": "tool_call",
                    # This the update provided by the human
                    "args": review_data,
                }
            ],
            # This is important - this needs to be the same as the message you replacing!
            # Otherwise, it will show up as a separate message
            "id": last_message.id,
        }
        print("updated_message:")
        print(updated_message)
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


def route_after_llm(state) -> Literal[END, "review"]:
    if len(state["messages"][-1].tool_calls) == 0:
        return END
    else:
        return "review"


builder = StateGraph(MessagesState)
builder.add_node(assistant)
builder.add_node(ToolNode([get_projects, book_time_entry]))
builder.add_node(review)
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route_after_llm)
builder.add_edge("tools", "assistant")

# Add
graph = builder.compile()
