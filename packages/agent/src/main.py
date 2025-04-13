#!/usr/bin/env python
import os
import sys
from datetime import date
from uuid import UUID
from typing import List
from langchain_anthropic import ChatAnthropic
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import START, StateGraph
from langgraph.prebuilt import tools_condition, ToolNode

from .api_client import ApiClient
from .api_models import (
    TimeEntry, CreateTimeEntryCommand, UpdateTimeEntryCommand,
    GetTimeEntriesForUserResult, GetAllProjectsResponse
)

user_id = "user123"  # Example user ID


def get_today():
    """Get today's date."""
    return date.today().isoformat()


def main():
    api_url = os.environ.get('API_URL', 'http://localhost:5008')
    client = ApiClient(base_url=api_url)

    tools = [client.get_all_projects, client.create_time_entry]

    llm = ChatAnthropic(model="claude-3-7-sonnet-20250219")

    llm_with_tools = llm.bind_tools(tools)

    # System message
    sys_msg = SystemMessage(
        content="You are a terse assistant tasked with helping "
        "an Intertech employee with user_id " +
        user_id + " track time spent on projects. "
        "Today is " + get_today() + ".")

    def assistant(state: MessagesState):
        return {"messages": [llm_with_tools.invoke([sys_msg] + state["messages"])]}

    # Graph
    builder = StateGraph(MessagesState)

    # Nodes
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(tools))

    # Edges
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges(
        "assistant",
        tools_condition,
    )
    builder.add_edge("tools", "assistant")
    react_graph = builder.compile()

    messages = [HumanMessage(
        content="I spent all day on Wednesday working on the mobile app development.")]
    messages = react_graph.invoke({"messages": messages})

    for m in messages['messages']:
        m.pretty_print()


if __name__ == "__main__":
    sys.exit(main())
