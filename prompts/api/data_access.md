# API Data Access

Use Entity Framework Core to create a data access layer for the API in packages/api.

- Create a DbContext for the models in the Models folder
  - Create the file in the Data folder
  - Configure the DbContext to use a SQLite database
  - Add dependency injection configuration for the DbContext
  - Name the database timetracker.db
  - Format all C# code using `dotnet csharpier .`
