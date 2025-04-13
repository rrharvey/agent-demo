"""This module provides example tools for web scraping and search functionality.

It includes a basic Tavily search function (as an example)

These tools are intended as free examples to get started. For production use,
consider implementing more robust and specialized tools tailored to your needs.
"""

from typing import Any, Callable, List, Optional, cast

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg
from typing_extensions import Annotated
from .api_client import ApiClient
from .api_models import CreateTimeEntryCommand, GetAllProjectsResponse, TimeEntry
from react_agent.configuration import Configuration


# async def search(
#     query: str, *, config: Annotated[RunnableConfig, InjectedToolArg]
# ) -> Optional[list[dict[str, Any]]]:
#     """Search for general web results.

#     This function performs a search using the Tavily search engine, which is designed
#     to provide comprehensive, accurate, and trusted results. It's particularly useful
#     for answering questions about current events.
#     """
#     configuration = Configuration.from_runnable_config(config)
#     wrapped = TavilySearchResults(max_results=configuration.max_search_results)
#     result = await wrapped.ainvoke({"query": query})
#     return cast(list[dict[str, Any]], result)

def get_projects(*, config: Annotated[RunnableConfig, InjectedToolArg]) -> GetAllProjectsResponse:
    """Get all projects with their client information

    Returns:
        Response containing list of projects
    """
    configuration = Configuration.from_runnable_config(config)
    client = ApiClient(configuration.api_url)
    return client.get_all_projects()


def create_time_entry(command: CreateTimeEntryCommand, *, config: Annotated[RunnableConfig, InjectedToolArg]) -> TimeEntry:
    """Create a new time entry

    Args:
        command: The create time entry command

    Returns:
        The created time entry
    """
    configuration = Configuration.from_runnable_config(config)
    client = ApiClient(configuration.api_url)
    return client.create_time_entry(command)


TOOLS: List[Callable[..., Any]] = [get_projects, create_time_entry]
