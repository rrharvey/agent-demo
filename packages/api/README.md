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

## API Documentation

When running in development mode, the OpenAPI documentation is available via .NET 9's built-in OpenAPI support. You can access the API documentation at `/swagger` or `/openapi` endpoints.
