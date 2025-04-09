# Time Tracking API

A .NET 9 API for tracking time entries for client consulting projects.

## Technologies Used

- .NET 9 with ASP.NET Core
- SQLite for database storage
- Entity Framework Core for data access
- Minimal APIs for API endpoints
- .NET 9 built-in OpenAPI support for API documentation

## Project Structure

The API follows a clean organization pattern:

- **Models/**: Contains domain models and DTOs
- **Data/**: Contains the EF Core DbContext and database configuration
- **Endpoints/**: Contains organized endpoint definitions separated by entity type

## Key Features

- Client management
- Project management with client relationships
- Time entry tracking with start/stop functionality
- Reporting and summary capabilities
- Filtering options for time entries

## API Reference

### Client Endpoints

#### GET /api/clients

Retrieves all clients.

**Response Schema:**

```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "description": "Technology solutions provider",
    "isActive": true,
    "createdAt": "2025-04-08T14:30:00Z"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved clients

#### GET /api/clients/{id}

Retrieves a specific client by ID.

**Path Parameters:**

- `id` (integer): The unique identifier of the client

**Response Schema:**

```json
{
  "id": 1,
  "name": "Acme Corp",
  "description": "Technology solutions provider",
  "isActive": true,
  "createdAt": "2025-04-08T14:30:00Z"
}
```

**Response Codes:**

- `200 OK`: Successfully retrieved client
- `404 Not Found`: Client with the specified ID was not found

#### POST /api/clients

Creates a new client.

**Request Body Schema:**

```json
{
  "name": "New Client",
  "description": "Client description"
}
```

**Response Schema:**

```json
{
  "id": 2,
  "name": "New Client",
  "description": "Client description",
  "isActive": true,
  "createdAt": "2025-04-09T10:30:00Z"
}
```

**Response Codes:**

- `201 Created`: Successfully created client

#### PUT /api/clients/{id}

Updates an existing client.

**Path Parameters:**

- `id` (integer): The unique identifier of the client

**Request Body Schema:**

```json
{
  "name": "Updated Client Name",
  "description": "Updated description",
  "isActive": true
}
```

**Response Schema:**

```json
{
  "id": 1,
  "name": "Updated Client Name",
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2025-04-08T14:30:00Z"
}
```

**Response Codes:**

- `200 OK`: Successfully updated client
- `404 Not Found`: Client with the specified ID was not found

#### DELETE /api/clients/{id}

Deletes a client.

**Path Parameters:**

- `id` (integer): The unique identifier of the client

**Response Codes:**

- `204 No Content`: Successfully deleted client
- `404 Not Found`: Client with the specified ID was not found

### Project Endpoints

#### GET /api/projects

Retrieves all projects.

**Response Schema:**

```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Corporate website overhaul",
    "isActive": true,
    "clientId": 1,
    "clientName": "Acme Corp",
    "createdAt": "2025-04-08T14:30:00Z"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved projects

#### GET /api/projects/{id}

Retrieves a specific project by ID.

**Path Parameters:**

- `id` (integer): The unique identifier of the project

**Response Schema:**

```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Corporate website overhaul",
  "isActive": true,
  "clientId": 1,
  "clientName": "Acme Corp",
  "createdAt": "2025-04-08T14:30:00Z"
}
```

**Response Codes:**

- `200 OK`: Successfully retrieved project
- `404 Not Found`: Project with the specified ID was not found

#### POST /api/projects

Creates a new project.

**Request Body Schema:**

```json
{
  "name": "Mobile App Development",
  "description": "iOS and Android app",
  "clientId": 1
}
```

**Response Schema:**

```json
{
  "id": 2,
  "name": "Mobile App Development",
  "description": "iOS and Android app",
  "isActive": true,
  "clientId": 1,
  "clientName": "Acme Corp",
  "createdAt": "2025-04-09T10:30:00Z"
}
```

**Response Codes:**

- `201 Created`: Successfully created project
- `400 Bad Request`: Invalid client ID

#### PUT /api/projects/{id}

Updates an existing project.

**Path Parameters:**

- `id` (integer): The unique identifier of the project

**Request Body Schema:**

```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "isActive": true,
  "clientId": 1
}
```

**Response Schema:**

```json
{
  "id": 1,
  "name": "Updated Project Name",
  "description": "Updated description",
  "isActive": true,
  "clientId": 1,
  "clientName": "Acme Corp",
  "createdAt": "2025-04-08T14:30:00Z"
}
```

**Response Codes:**

- `200 OK`: Successfully updated project
- `400 Bad Request`: Invalid client ID
- `404 Not Found`: Project with the specified ID was not found

#### DELETE /api/projects/{id}

Deletes a project.

**Path Parameters:**

- `id` (integer): The unique identifier of the project

**Response Codes:**

- `204 No Content`: Successfully deleted project
- `404 Not Found`: Project with the specified ID was not found

#### GET /api/clients/{clientId}/projects

Retrieves all projects for a specific client.

**Path Parameters:**

- `clientId` (integer): The unique identifier of the client

**Response Schema:**

```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Corporate website overhaul",
    "isActive": true,
    "clientId": 1,
    "clientName": "Acme Corp",
    "createdAt": "2025-04-08T14:30:00Z"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved projects
- `404 Not Found`: Client with the specified ID was not found

### Time Entry Endpoints

#### GET /api/time-entries

Retrieves all time entries for a user.

**Query Parameters:**

- `userId` (string, required): The identifier of the user

**Response Schema:**

```json
[
  {
    "id": 1,
    "description": "Working on homepage",
    "startTime": "2025-04-09T08:30:00Z",
    "endTime": "2025-04-09T12:30:00Z",
    "projectId": 1,
    "projectName": "Website Redesign",
    "clientName": "Acme Corp",
    "userId": "user123",
    "userName": "John Doe",
    "isBillable": true,
    "createdAt": "2025-04-09T08:30:00Z",
    "duration": "04:00:00"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved time entries
- `400 Bad Request`: UserId is missing

#### GET /api/time-entries/{id}

Retrieves a specific time entry.

**Path Parameters:**

- `id` (integer): The unique identifier of the time entry

**Response Schema:**

```json
{
  "id": 1,
  "description": "Working on homepage",
  "startTime": "2025-04-09T08:30:00Z",
  "endTime": "2025-04-09T12:30:00Z",
  "projectId": 1,
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true,
  "createdAt": "2025-04-09T08:30:00Z",
  "duration": "04:00:00"
}
```

**Response Codes:**

- `200 OK`: Successfully retrieved time entry
- `404 Not Found`: Time entry with the specified ID was not found

#### POST /api/time-entries

Creates a new time entry.

**Request Body Schema:**

```json
{
  "description": "Working on homepage",
  "startTime": "2025-04-09T08:30:00Z",
  "endTime": "2025-04-09T12:30:00Z",
  "projectId": 1,
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true
}
```

**Response Schema:**

```json
{
  "id": 1,
  "description": "Working on homepage",
  "startTime": "2025-04-09T08:30:00Z",
  "endTime": "2025-04-09T12:30:00Z",
  "projectId": 1,
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true,
  "createdAt": "2025-04-09T08:30:00Z",
  "duration": "04:00:00"
}
```

**Response Codes:**

- `201 Created`: Successfully created time entry
- `400 Bad Request`: Invalid project ID

#### PUT /api/time-entries/{id}

Updates an existing time entry.

**Path Parameters:**

- `id` (integer): The unique identifier of the time entry

**Request Body Schema:**

```json
{
  "description": "Updated description",
  "startTime": "2025-04-09T08:30:00Z",
  "endTime": "2025-04-09T13:30:00Z",
  "projectId": 1,
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true
}
```

**Response Schema:**

```json
{
  "id": 1,
  "description": "Updated description",
  "startTime": "2025-04-09T08:30:00Z",
  "endTime": "2025-04-09T13:30:00Z",
  "projectId": 1,
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true,
  "createdAt": "2025-04-09T08:30:00Z",
  "duration": "05:00:00"
}
```

**Response Codes:**

- `200 OK`: Successfully updated time entry
- `400 Bad Request`: Invalid project ID
- `404 Not Found`: Time entry with the specified ID was not found

#### DELETE /api/time-entries/{id}

Deletes a time entry.

**Path Parameters:**

- `id` (integer): The unique identifier of the time entry

**Response Codes:**

- `204 No Content`: Successfully deleted time entry
- `404 Not Found`: Time entry with the specified ID was not found

#### GET /api/projects/{projectId}/time-entries

Retrieves all time entries for a specific project.

**Path Parameters:**

- `projectId` (integer): The unique identifier of the project

**Response Schema:**

```json
[
  {
    "id": 1,
    "description": "Working on homepage",
    "startTime": "2025-04-09T08:30:00Z",
    "endTime": "2025-04-09T12:30:00Z",
    "projectId": 1,
    "projectName": "Website Redesign",
    "clientName": "Acme Corp",
    "userId": "user123",
    "userName": "John Doe",
    "isBillable": true,
    "createdAt": "2025-04-09T08:30:00Z",
    "duration": "04:00:00"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved time entries
- `404 Not Found`: Project with the specified ID was not found

#### POST /api/time-entries/start

Starts a new time entry with the current time as the start time.

**Request Body Schema:**

```json
{
  "description": "Starting new task",
  "projectId": 1,
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true
}
```

**Response Schema:**

```json
{
  "id": 2,
  "description": "Starting new task",
  "startTime": "2025-04-09T14:30:00Z",
  "endTime": null,
  "projectId": 1,
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true,
  "createdAt": "2025-04-09T14:30:00Z",
  "duration": null
}
```

**Response Codes:**

- `201 Created`: Successfully started time entry
- `400 Bad Request`: Invalid project ID

#### PUT /api/time-entries/{id}/stop

Stops an active time entry by setting the end time to the current time.

**Path Parameters:**

- `id` (integer): The unique identifier of the time entry

**Response Schema:**

```json
{
  "id": 2,
  "description": "Starting new task",
  "startTime": "2025-04-09T14:30:00Z",
  "endTime": "2025-04-09T16:30:00Z",
  "projectId": 1,
  "projectName": "Website Redesign",
  "clientName": "Acme Corp",
  "userId": "user123",
  "userName": "John Doe",
  "isBillable": true,
  "createdAt": "2025-04-09T14:30:00Z",
  "duration": "02:00:00"
}
```

**Response Codes:**

- `200 OK`: Successfully stopped time entry
- `400 Bad Request`: Time entry is already stopped
- `404 Not Found`: Time entry with the specified ID was not found

### Reporting Endpoints

#### GET /api/reports/time-entries

Retrieves time entries with various filtering options.

**Query Parameters:**

- `startDate` (DateTime, optional): Filter entries starting from this date
- `endDate` (DateTime, optional): Filter entries up to this date
- `projectId` (integer, optional): Filter by project ID
- `clientId` (integer, optional): Filter by client ID
- `userId` (string, optional): Filter by user ID
- `isBillable` (boolean, optional): Filter by billable status

**Response Schema:**

```json
[
  {
    "id": 1,
    "description": "Working on homepage",
    "startTime": "2025-04-09T08:30:00Z",
    "endTime": "2025-04-09T12:30:00Z",
    "projectId": 1,
    "projectName": "Website Redesign",
    "clientName": "Acme Corp",
    "userId": "user123",
    "userName": "John Doe",
    "isBillable": true,
    "createdAt": "2025-04-09T08:30:00Z",
    "duration": "04:00:00"
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved filtered time entries

#### GET /api/reports/summary/by-project

Retrieves time summary grouped by project.

**Query Parameters:**

- `startDate` (DateTime, optional): Filter entries starting from this date
- `endDate` (DateTime, optional): Filter entries up to this date

**Response Schema:**

```json
[
  {
    "projectId": 1,
    "projectName": "Website Redesign",
    "totalEntries": 5,
    "totalHours": 25.5,
    "billableHours": 20.0,
    "nonBillableHours": 5.5
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved project summary

#### GET /api/reports/summary/by-client

Retrieves time summary grouped by client.

**Query Parameters:**

- `startDate` (DateTime, optional): Filter entries starting from this date
- `endDate` (DateTime, optional): Filter entries up to this date

**Response Schema:**

```json
[
  {
    "clientId": 1,
    "clientName": "Acme Corp",
    "totalEntries": 8,
    "totalHours": 32.5,
    "billableHours": 28.5,
    "nonBillableHours": 4.0
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved client summary

#### GET /api/reports/summary/by-user

Retrieves time summary grouped by user.

**Query Parameters:**

- `startDate` (DateTime, optional): Filter entries starting from this date
- `endDate` (DateTime, optional): Filter entries up to this date

**Response Schema:**

```json
[
  {
    "userId": "user123",
    "userName": "John Doe",
    "totalEntries": 10,
    "totalHours": 45.0,
    "billableHours": 40.0,
    "nonBillableHours": 5.0
  }
]
```

**Response Codes:**

- `200 OK`: Successfully retrieved user summary

## Running the API

```sh
cd /path/to/api
dotnet run
```

The API will be available at http://localhost:5000 by default.

## API Documentation

When running in development mode, the OpenAPI documentation is available via .NET 9's built-in OpenAPI support. You can access the API documentation at `/swagger` or `/openapi` endpoints.
