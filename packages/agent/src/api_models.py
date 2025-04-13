#!/usr/bin/env python
from dataclasses import dataclass
from typing import List, Optional
from datetime import date
from uuid import UUID


@dataclass
class Project:
    """Project model"""
    id: UUID
    name: str
    client_id: UUID


@dataclass
class ProjectDto:
    """Project data transfer object"""
    project_id: UUID
    project_name: str
    client_name: str


@dataclass
class Client:
    """Client model"""
    id: UUID
    name: str
    projects: List[Project]


@dataclass
class TimeEntry:
    """Time entry model"""
    id: Optional[int] = None
    project_id: Optional[UUID] = None
    user_id: Optional[str] = None
    date: Optional[date] = None
    hours: Optional[float] = None


@dataclass
class CreateTimeEntryCommand:
    """Command to create a time entry"""
    project_id: UUID
    user_id: str
    date: date
    hours: float


@dataclass
class UpdateTimeEntryCommand:
    """Command to update a time entry"""
    id: int
    project_id: UUID
    user_id: str
    date: date
    hours: float


@dataclass
class GetTimeEntriesForUserResult:
    """Result of get time entries for user query"""
    time_entries: List[TimeEntry]


@dataclass
class GetTimeEntryByIdResult:
    """Result of get time entry by id query"""
    time_entry: Optional[TimeEntry]


@dataclass
class GetAllProjectsResponse:
    """Response for get all projects query"""
    projects: List[ProjectDto]


@dataclass
class GetAllClientsResponse:
    """Response for get all clients query"""
    clients: List[Client]
