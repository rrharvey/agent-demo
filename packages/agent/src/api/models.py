from dataclasses import dataclass, asdict
from datetime import date
from typing import List, Optional, Dict, Any
from uuid import UUID


@dataclass
class Project:
    """Project model from the API."""
    id: UUID
    name: str
    clientId: UUID

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['id'] = str(data['id'])
        data['clientId'] = str(data['clientId'])
        return data


@dataclass
class Client:
    """Client model from the API."""
    id: UUID
    name: str
    projects: List[Project]

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['id'] = str(data['id'])
        data['projects'] = [project.to_dict() for project in self.projects]
        return data


@dataclass
class ProjectDto:
    """Project data transfer object from the API."""
    projectId: UUID
    projectName: str
    clientName: str

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['projectId'] = str(data['projectId'])
        return data


@dataclass
class TimeEntry:
    """Time entry model from the API."""
    id: Optional[int] = None
    projectId: Optional[UUID] = None
    userId: Optional[str] = None
    date: Optional[date] = None
    hours: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        if data['projectId'] is not None:
            data['projectId'] = str(data['projectId'])
        if data['date'] is not None:
            data['date'] = data['date'].isoformat()
        return data


@dataclass
class CreateTimeEntryCommand:
    """Command to create a time entry."""
    projectId: UUID
    userId: str
    date: date
    hours: float

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['projectId'] = str(data['projectId'])
        data['date'] = self.date.isoformat()
        return data


@dataclass
class UpdateTimeEntryCommand:
    """Command to update a time entry."""
    id: int
    projectId: UUID
    userId: str
    date: date
    hours: float

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['projectId'] = str(data['projectId'])
        data['date'] = self.date.isoformat()
        return data


@dataclass
class GetTimeEntriesForUserResult:
    """Result of getting time entries for a user."""
    timeEntries: List[TimeEntry]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'timeEntries': [entry.to_dict() for entry in self.timeEntries]
        }


@dataclass
class GetTimeEntryByIdResult:
    """Result of getting a time entry by ID."""
    timeEntry: Optional[TimeEntry]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'timeEntry': self.timeEntry.to_dict() if self.timeEntry else None
        }


@dataclass
class GetAllProjectsResponse:
    """Response containing all projects."""
    projects: List[ProjectDto]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'projects': [project.to_dict() for project in self.projects]
        }


@dataclass
class GetAllClientsResponse:
    """Response containing all clients."""
    clients: List[Client]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'clients': [client.to_dict() for client in self.clients]
        }
