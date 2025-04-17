namespace Api.Features.TimeEntries;

using Api;
using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

public record TimeEntryDto(
  int Id,
  Guid ProjectId,
  string ProjectName,
  Guid ClientId,
  string ClientName,
  string UserId,
  DateOnly Date,
  decimal Hours
);

public record CreateTimeEntryCommand(Guid ProjectId, string UserId, DateOnly Date, decimal Hours)
  : ICommand<TimeEntryDto>;

public class CreateTimeEntryHandler(ApplicationDbContext dbContext)
  : ICommandHandler<CreateTimeEntryCommand, TimeEntryDto>
{
  public async Task<TimeEntryDto> HandleAsync(
    CreateTimeEntryCommand command,
    CancellationToken cancellationToken = default
  )
  {
    var timeEntry = new TimeEntry
    {
      ProjectId = command.ProjectId,
      UserId = command.UserId,
      Date = command.Date,
      Hours = command.Hours,
    };

    dbContext.TimeEntries.Add(timeEntry);
    await dbContext.SaveChangesAsync(cancellationToken);

    // Fetch related project information
    var project =
      await dbContext.Projects.FirstOrDefaultAsync(p => p.Id == command.ProjectId, cancellationToken)
      ?? throw new InvalidOperationException($"Project with ID {command.ProjectId} not found");

    // Fetch client information
    var client =
      await dbContext.Clients.FirstOrDefaultAsync(c => c.Id == project.ClientId, cancellationToken)
      ?? throw new InvalidOperationException($"Client with ID {project.ClientId} not found");

    return new TimeEntryDto(
      timeEntry.Id,
      timeEntry.ProjectId,
      project.Name,
      project.ClientId,
      client.Name,
      timeEntry.UserId,
      timeEntry.Date,
      timeEntry.Hours
    );
  }
}
