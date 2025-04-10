using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.TimeEntries;

public record GetTimeEntryByIdQuery(int Id) : IQuery<GetTimeEntryByIdResult>;

public record GetTimeEntryByIdResult(TimeEntry? TimeEntry);

public class GetTimeEntryByIdHandler(ApplicationDbContext dbContext)
  : IQueryHandler<GetTimeEntryByIdQuery, GetTimeEntryByIdResult>
{
  public async Task<GetTimeEntryByIdResult> HandleAsync(
    GetTimeEntryByIdQuery query,
    CancellationToken cancellationToken = default
  )
  {
    var timeEntry = await dbContext
      .TimeEntries.AsNoTracking()
      .FirstOrDefaultAsync(te => te.Id == query.Id, cancellationToken);

    return new GetTimeEntryByIdResult(timeEntry);
  }
}
