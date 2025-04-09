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

## API Endpoints

The API provides the following endpoint categories:

### Client Endpoints

- GET `/api/clients` - Get all clients
- GET `/api/clients/{id}` - Get a specific client
- POST `/api/clients` - Create a new client
- PUT `/api/clients/{id}` - Update a client
- DELETE `/api/clients/{id}` - Delete a client

### Project Endpoints

- GET `/api/projects` - Get all projects
- GET `/api/projects/{id}` - Get a specific project
- POST `/api/projects` - Create a new project
- PUT `/api/projects/{id}` - Update a project
- DELETE `/api/projects/{id}` - Delete a project
- GET `/api/clients/{clientId}/projects` - Get projects for a specific client

### Time Entry Endpoints

- GET `/api/time-entries` - Get all time entries
- GET `/api/time-entries/{id}` - Get a specific time entry
- POST `/api/time-entries` - Create a new time entry
- PUT `/api/time-entries/{id}` - Update a time entry
- DELETE `/api/time-entries/{id}` - Delete a time entry
- GET `/api/projects/{projectId}/time-entries` - Get time entries for a specific project
- POST `/api/time-entries/start` - Start a new time entry
- PUT `/api/time-entries/{id}/stop` - Stop a time entry

### Reporting Endpoints

- GET `/api/reports/time-entries` - Get filtered time entries
- GET `/api/reports/summary/by-project` - Get time summary by project
- GET `/api/reports/summary/by-client` - Get time summary by client
- GET `/api/reports/summary/by-user` - Get time summary by user

## Running the API

```sh
cd /path/to/api
dotnet run
```

The API will be available at http://localhost:5000 by default.

## API Documentation

When running in development mode, the OpenAPI documentation is available via .NET 9's built-in OpenAPI support. You can access the API documentation at `/swagger` or `/openapi` endpoints.
