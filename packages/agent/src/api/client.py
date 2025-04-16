import requests
from typing import Dict, List, Any, Optional


class TimeTrackingApiClient:
    """Client for interacting with the Time Tracking API."""

    def __init__(self, base_url: str):
        """
        Initialize the API client.

        Args:
            base_url: The base URL of the API.
        """
        self.base_url = base_url.rstrip('/')

    def get_all_projects(self) -> List[Dict[str, Any]]:
        """
        Get a list of all available projects.

        Returns:
            A list of project objects containing client name, project name and project ID.

        Raises:
            Exception: If the API request fails.
        """
        try:
            response = requests.get(f"{self.base_url}/projects")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch projects: {str(e)}")

    def create_time_entry(
        self,
        project_id: str,
        user_id: str,
        date: str,
        hours: int,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new time entry for a project.

        Args:
            project_id: The ID of the project to book time against.
            user_id: The ID of the user logging the time entry.
            date: The date for the time entry in ISO format (YYYY-MM-DD).
            hours: The number of hours to book.
            description: Optional description of the work done.

        Returns:
            The created time entry object.

        Raises:
            Exception: If the API request fails.
        """
        payload = {
            "projectId": project_id,
            "userId": user_id,
            "date": date,
            "hours": hours
        }

        if description:
            payload["description"] = description

        try:
            response = requests.post(
                f"{self.base_url}/time-entries",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create time entry: {str(e)}")
