#!/usr/bin/env python
import requests
import json
from typing import Optional, List, Dict, Any, Union, TypeVar, Type, cast
from datetime import date, datetime
from uuid import UUID

from .api_models import (
    TimeEntry, Client, Project, ProjectDto,
    CreateTimeEntryCommand, UpdateTimeEntryCommand,
    GetTimeEntriesForUserResult, GetTimeEntryByIdResult,
    GetAllProjectsResponse, GetAllClientsResponse
)

T = TypeVar('T')


class ApiClient:
    """HTTP client for the Time Tracker API"""

    def __init__(self, base_url: str = "http://localhost:5000"):
        """Initialize the API client with the base URL

        Args:
            base_url: The base URL of the API
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()

    def _handle_response(self, response: requests.Response) -> Any:
        """Handle the API response

        Args:
            response: The HTTP response from the API

        Returns:
            The JSON response data if successful

        Raises:
            requests.HTTPError: If the response status code indicates an error
        """
        response.raise_for_status()
        if response.status_code == 204:  # No Content
            return None
        return response.json() if response.content else None

    def _convert_to_model(self, data: Dict, model_class: Type[T]) -> T:
        """Convert API data to a model instance

        Args:
            data: The API data dictionary
            model_class: The model class to convert to

        Returns:
            An instance of the model class
        """
        # Convert camelCase keys to snake_case
        transformed_data = {}
        for key, value in data.items():
            snake_key = ''.join(
                ['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')

            # Handle special case for UUID fields
            if isinstance(value, str) and snake_key.endswith('_id') and snake_key != 'user_id':
                try:
                    transformed_data[snake_key] = UUID(value)
                except ValueError:
                    transformed_data[snake_key] = value
            # Handle date fields
            elif isinstance(value, str) and snake_key == 'date':
                try:
                    transformed_data[snake_key] = date.fromisoformat(value)
                except ValueError:
                    transformed_data[snake_key] = value
            # Handle nested objects or lists
            elif isinstance(value, dict):
                if hasattr(model_class, '__annotations__') and snake_key in model_class.__annotations__:
                    nested_type = model_class.__annotations__[snake_key]
                    # Extract the inner type from Optional, List, etc.
                    if hasattr(nested_type, '__origin__') and nested_type.__origin__ is Union:
                        nested_type = next(
                            arg for arg in nested_type.__args__ if arg is not type(None))
                    transformed_data[snake_key] = self._convert_to_model(
                        value, nested_type)
                else:
                    transformed_data[snake_key] = value
            elif isinstance(value, list) and value and isinstance(value[0], dict):
                if hasattr(model_class, '__annotations__') and snake_key in model_class.__annotations__:
                    list_type = model_class.__annotations__[snake_key]
                    if hasattr(list_type, '__origin__') and list_type.__origin__ is list:
                        item_type = list_type.__args__[0]
                        transformed_data[snake_key] = [
                            self._convert_to_model(item, item_type) for item in value]
                    else:
                        transformed_data[snake_key] = value
                else:
                    transformed_data[snake_key] = value
            else:
                transformed_data[snake_key] = value

        return model_class(**transformed_data)

    def _convert_from_model(self, model: Any) -> Dict:
        """Convert a model instance to API data

        Args:
            model: The model instance to convert

        Returns:
            A dictionary in the format expected by the API
        """
        data = {}

        for key, value in model.__dict__.items():
            # Convert snake_case to camelCase
            camel_key = key[0] + ''.join([c.capitalize() if c ==
                                         '_' else c for c in key[1:]]).replace('_', '')

            # Handle special cases for date and UUID
            if isinstance(value, date):
                data[camel_key] = value.isoformat()
            elif isinstance(value, UUID):
                data[camel_key] = str(value)
            elif hasattr(value, '__dict__'):
                # Handle nested objects
                data[camel_key] = self._convert_from_model(value)
            elif isinstance(value, list) and value and hasattr(value[0], '__dict__'):
                # Handle lists of objects
                data[camel_key] = [
                    self._convert_from_model(item) for item in value]
            else:
                # Handle primitive types
                data[camel_key] = value

        return data

    # Time Entry Endpoints

    def get_time_entries_for_user(self, user_id: str,
                                  project_id: Optional[UUID] = None,
                                  start_date: Optional[date] = None,
                                  end_date: Optional[date] = None) -> GetTimeEntriesForUserResult:
        """Get time entries for a user with optional filtering

        Args:
            user_id: ID of the user to retrieve time entries for
            project_id: Optional project ID to filter by
            start_date: Optional start date to filter from
            end_date: Optional end date to filter to

        Returns:
            Time entries result with list of time entries
        """
        params = {'userId': user_id}

        if project_id:
            params['projectId'] = str(project_id)
        if start_date:
            params['startDate'] = start_date.isoformat()
        if end_date:
            params['endDate'] = end_date.isoformat()

        response = self.session.get(
            f"{self.base_url}/time-entries", params=params)
        data = self._handle_response(response)
        return self._convert_to_model(data, GetTimeEntriesForUserResult)

    def create_time_entry(self, command: CreateTimeEntryCommand) -> TimeEntry:
        """Create a new time entry

        Args:
            command: The create time entry command

        Returns:
            The created time entry
        """
        payload = self._convert_from_model(command)

        response = self.session.post(
            f"{self.base_url}/time-entries",
            json=payload
        )
        data = self._handle_response(response)
        return self._convert_to_model(data, TimeEntry)

    def get_time_entry_by_id(self, entry_id: int) -> GetTimeEntryByIdResult:
        """Get a time entry by ID

        Args:
            entry_id: ID of the time entry to retrieve

        Returns:
            The time entry result if found

        Raises:
            requests.HTTPError: If the time entry is not found
        """
        response = self.session.get(f"{self.base_url}/time-entries/{entry_id}")
        data = self._handle_response(response)
        return self._convert_to_model(data, GetTimeEntryByIdResult)

    def update_time_entry(self, command: UpdateTimeEntryCommand) -> TimeEntry:
        """Update an existing time entry

        Args:
            command: The update time entry command

        Returns:
            The updated time entry

        Raises:
            requests.HTTPError: If the time entry is not found
        """
        payload = self._convert_from_model(command)

        response = self.session.put(
            f"{self.base_url}/time-entries/{command.id}",
            json=payload
        )
        data = self._handle_response(response)
        return self._convert_to_model(data, TimeEntry)

    def delete_time_entry(self, entry_id: int) -> None:
        """Delete a time entry

        Args:
            entry_id: ID of the time entry to delete

        Raises:
            requests.HTTPError: If the time entry is not found
        """
        response = self.session.delete(
            f"{self.base_url}/time-entries/{entry_id}")
        self._handle_response(response)

    # Project Endpoints

    def get_all_projects(self) -> GetAllProjectsResponse:
        """Get all projects with their client information

        Returns:
            Response containing list of projects
        """
        response = self.session.get(f"{self.base_url}/projects")
        data = self._handle_response(response)
        return self._convert_to_model(data, GetAllProjectsResponse)

    # Client Endpoints

    def get_all_clients(self) -> GetAllClientsResponse:
        """Get all clients with their projects

        Returns:
            Response containing list of clients with their projects
        """
        response = self.session.get(f"{self.base_url}/clients")
        data = self._handle_response(response)
        return self._convert_to_model(data, GetAllClientsResponse)
