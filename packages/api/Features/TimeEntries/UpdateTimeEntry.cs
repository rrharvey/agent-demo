namespace Api.Features.TimeEntries;

using Api;
using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

public record UpdateTimeEntryCommand(int Id, Guid ProjectId, string UserId, DateOnly Date, decimal Hours)
  : ICommand<TimeEntry?>;

public class UpdateTimeEntryHandler(ApplicationDbContext dbContext)
  : ICommandHandler<UpdateTimeEntryCommand, TimeEntry?>
{
  public async Task<TimeEntry?> HandleAsync(
    UpdateTimeEntryCommand command,
    CancellationToken cancellationToken = default
  )
  {
    var timeEntry = await dbContext.TimeEntries.FirstOrDefaultAsync(t => t.Id == command.Id, cancellationToken);

    if (timeEntry == null)
    {
      return null;
    }

    // Update the time entry properties
    timeEntry.ProjectId = command.ProjectId;
    timeEntry.UserId = command.UserId;
    timeEntry.Date = command.Date;
    timeEntry.Hours = command.Hours;

    await dbContext.SaveChangesAsync(cancellationToken);

    return timeEntry;
  }
}
