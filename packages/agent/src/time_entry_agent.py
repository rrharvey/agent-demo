from datetime import date
from db_access import DatabaseAccess
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import RemoveMessage
from langchain_core.messages import SystemMessage, ToolMessage
from langchain_core.tools import tool
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


@tool
def get_database_schema():
    """
    Returns the database schema for the time tracking system.
    """
    db = DatabaseAccess()
    schema = db.get_schema()
    return schema


@tool
def execute_query(query: str):
    """
    Executes a SQL SELECT query on the time tracking database.
    """
    # Check if query contains any data modification keywords
    if any(keyword in query.lower() for keyword in ["delete", "insert", "update"]):
        return "You are not allowed to modify existing data. You may only create new time entries."
    db = DatabaseAccess()
    result = db.execute_query(query)
    return result


tools = [get_projects, book_time_entry, get_database_schema, execute_query]

model = ChatAnthropic(model="claude-3-7-sonnet-20250219",
                      temperature=0).bind_tools(tools)


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

    if tool_call["name"] != "book_time_entry":
        # If the tool call is not for booking a time entry, just run the tool
        return Command(goto="tools")

    # this is the value we'll be providing via Command(resume=<human_review>)
    human_review = interrupt(
        {
            "tool_call": tool_call,
        }
    )

    review_action = human_review["action"]
    review_data = human_review.get("data")

    # if approved, call the tool
    if review_action == "approve":
        return Command(goto="tools")

    # update the AI message AND call tools
    elif review_action == "update":
        print(state["messages"])
        updated_messages = [RemoveMessage(id=m.id)
                            for m in state["messages"][:-1]]
        updated_messages.append({
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
        })
        return Command(goto="tools", update={"messages": updated_messages})

    # if cancelled, remove all but the last message so the LLM doesn't have information about the cancelled entry
    elif review_action == 'cancel':
        updated_messages = [RemoveMessage(id=m.id)
                            for m in state["messages"][:-1]]
        updated_messages.append(ToolMessage(
            "Successfully canceled the time entry. You're welcome.", name=tool_call["name"], tool_call_id=tool_call["id"]))
        return Command(goto="assistant", update={"messages": updated_messages})


def route_after_llm(state) -> Literal[END, "review"]:
    if len(state["messages"][-1].tool_calls) == 0:
        return END
    else:
        return "review"


builder = StateGraph(MessagesState)
builder.add_node(assistant)
builder.add_node(ToolNode(tools))
builder.add_node(review)
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route_after_llm)
builder.add_edge("tools", "assistant")

# Add
graph = builder.compile()
