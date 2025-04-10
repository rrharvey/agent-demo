namespace Api.Features.TimeEntries;

using Api;
using Api.Data;
using Microsoft.EntityFrameworkCore;

public record DeleteTimeEntryCommand(int Id) : ICommand<bool>;

public class DeleteTimeEntryHandler(ApplicationDbContext dbContext) : ICommandHandler<DeleteTimeEntryCommand, bool>
{
  public async Task<bool> HandleAsync(DeleteTimeEntryCommand command, CancellationToken cancellationToken = default)
  {
    var timeEntry = await dbContext.TimeEntries.FirstOrDefaultAsync(t => t.Id == command.Id, cancellationToken);

    if (timeEntry == null)
    {
      return false;
    }

    dbContext.TimeEntries.Remove(timeEntry);
    await dbContext.SaveChangesAsync(cancellationToken);

    return true;
  }
}
