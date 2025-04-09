namespace api.Models;

// Client DTOs
public record ClientDto(int Id, string Name, string? Description, bool IsActive, DateTime CreatedAt);
public record CreateClientDto(string Name, string? Description);
public record UpdateClientDto(string Name, string? Description, bool IsActive);

// Project DTOs
public record ProjectDto(int Id, string Name, string? Description, bool IsActive, int ClientId, string ClientName, DateTime CreatedAt);
public record CreateProjectDto(string Name, string? Description, int ClientId);
public record UpdateProjectDto(string Name, string? Description, bool IsActive, int ClientId);

// TimeEntry DTOs
public record TimeEntryDto(
    int Id, 
    string Description, 
    DateTime StartTime, 
    DateTime? EndTime, 
    int ProjectId,
    string ProjectName,
    string? ClientName,
    string? UserId, 
    string? UserName, 
    bool IsBillable, 
    DateTime CreatedAt,
    TimeSpan? Duration
);

public record CreateTimeEntryDto(
    string Description, 
    DateTime StartTime, 
    DateTime? EndTime, 
    int ProjectId, 
    string? UserId,
    string? UserName,
    bool IsBillable
);

public record UpdateTimeEntryDto(
    string Description, 
    DateTime StartTime, 
    DateTime? EndTime, 
    int ProjectId, 
    string? UserId,
    string? UserName,
    bool IsBillable
);