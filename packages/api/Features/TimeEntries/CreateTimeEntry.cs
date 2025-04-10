namespace Api.Features.TimeEntries;

using Api;
using Api.Data;
using Api.Models;

public record CreateTimeEntryCommand(Guid ProjectId, string UserId, DateOnly Date, decimal Hours) : ICommand<TimeEntry>;

public class CreateTimeEntryHandler(ApplicationDbContext dbContext) : ICommandHandler<CreateTimeEntryCommand, TimeEntry>
{
  public async Task<TimeEntry> HandleAsync(
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

    return timeEntry;
  }
}
