import json
from datetime import date
from typing import Dict, List, Optional, Union
from uuid import UUID

import requests

from .exceptions import ApiConnectionError, ApiResponseError, BadRequestError, NotFoundError
from .models import (
    Client,
    CreateTimeEntryCommand,
    GetAllClientsResponse,
    GetAllProjectsResponse,
    GetTimeEntriesForUserResult,
    GetTimeEntryByIdResult,
    ProjectDto,
    TimeEntry,
    UpdateTimeEntryCommand,
)
from .serialization import serialize_to_json


class TimeTrackingApiClient:
    """Client for interacting with the Time Tracking API."""

    def __init__(self, base_url: str):
        """
        Initialize the Time Tracking API client.

        Args:
            base_url: The base URL of the API (e.g., "http://localhost:5000")
        """
        self.base_url = base_url.rstrip("/")

    def _make_request(self, method: str, path: str, params: Optional[Dict] = None,
                      data: Optional[Dict] = None) -> Dict:
        """
        Make a request to the API and handle response/errors.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            path: API endpoint path
            params: Query parameters
            data: Request body data

        Returns:
            Response data as dictionary

        Raises:
            ApiConnectionError: If there's a network error
            BadRequestError: For 400 responses
            NotFoundError: For 404 responses
            ApiResponseError: For other error responses
        """
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = {"Content-Type": "application/json"} if data else {}

        json_data = None
        if data is not None:
            json_data = serialize_to_json(data)

        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                data=json_data,
                headers=headers
            )

            # Handle different status codes
            if response.status_code == 204:  # No content
                return {}

            if 200 <= response.status_code < 300:
                if not response.text:
                    return {}
                return response.json()

            if response.status_code == 400:
                raise BadRequestError(f"Bad request: {response.text}")

            if response.status_code == 404:
                raise NotFoundError(f"Resource not found: {response.text}")

            raise ApiResponseError(response.status_code, response.text)

        except requests.RequestException as e:
            raise ApiConnectionError(f"Connection error: {str(e)}")

    # Time Entries Endpoints

    def get_time_entries_for_user(self, user_id: str, project_id: Optional[UUID] = None,
                                  start_date: Optional[date] = None,
                                  end_date: Optional[date] = None) -> List[TimeEntry]:
        """
        Get time entries for a user with optional filtering.

        Args:
            user_id: ID of the user
            project_id: Optional project ID to filter by
            start_date: Optional start date to filter by
            end_date: Optional end date to filter by

        Returns:
            List of time entries
        """
        params = {"userId": user_id}

        if project_id:
            params["projectId"] = str(project_id)

        if start_date:
            params["startDate"] = start_date.isoformat()

        if end_date:
            params["endDate"] = end_date.isoformat()

        response = self._make_request("GET", "time-entries", params=params)
        time_entries_data = GetTimeEntriesForUserResult(**response)
        return time_entries_data.timeEntries

    def get_time_entry_by_id(self, entry_id: int) -> Optional[TimeEntry]:
        """
        Get a time entry by its ID.

        Args:
            entry_id: ID of the time entry

        Returns:
            TimeEntry if found, None if not

        Raises:
            NotFoundError: If the time entry is not found
        """
        response = self._make_request("GET", f"time-entries/{entry_id}")
        result = GetTimeEntryByIdResult(**response)
        return result.timeEntry

    def create_time_entry(self, project_id: UUID, user_id: str,
                          entry_date: date, hours: float) -> TimeEntry:
        """
        Create a new time entry.

        Args:
            project_id: ID of the project
            user_id: ID of the user
            entry_date: Date of the time entry
            hours: Number of hours

        Returns:
            The created TimeEntry

        Raises:
            BadRequestError: If the request is invalid
        """
        command = CreateTimeEntryCommand(
            projectId=project_id,
            userId=user_id,
            date=entry_date,
            hours=hours
        )

        response = self._make_request("POST", "time-entries", data=command)
        return TimeEntry(**response)

    def update_time_entry(self, entry_id: int, project_id: UUID, user_id: str,
                          entry_date: date, hours: float) -> TimeEntry:
        """
        Update an existing time entry.

        Args:
            entry_id: ID of the time entry to update
            project_id: ID of the project
            user_id: ID of the user
            entry_date: Date of the time entry
            hours: Number of hours

        Returns:
            The updated TimeEntry

        Raises:
            NotFoundError: If the time entry is not found
            BadRequestError: If the request is invalid
        """
        command = UpdateTimeEntryCommand(
            id=entry_id,
            projectId=project_id,
            userId=user_id,
            date=entry_date,
            hours=hours
        )

        response = self._make_request(
            "PUT", f"time-entries/{entry_id}", data=command)
        return TimeEntry(**response)

    def delete_time_entry(self, entry_id: int) -> None:
        """
        Delete a time entry.

        Args:
            entry_id: ID of the time entry to delete

        Raises:
            NotFoundError: If the time entry is not found
        """
        self._make_request("DELETE", f"time-entries/{entry_id}")

    # Projects Endpoints

    def get_all_projects(self) -> List[ProjectDto]:
        """
        Get all projects with their client information.

        Returns:
            List of projects with client information
        """
        response = self._make_request("GET", "projects")
        projects_data = GetAllProjectsResponse(**response)
        return projects_data.projects

    # Clients Endpoints

    def get_all_clients(self) -> List[Client]:
        """
        Get all clients with their projects.

        Returns:
            List of clients with their projects
        """
        response = self._make_request("GET", "clients")
        clients_data = GetAllClientsResponse(**response)
        return clients_data.clients
