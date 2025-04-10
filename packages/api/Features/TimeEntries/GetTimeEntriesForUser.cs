using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.TimeEntries;

public record GetTimeEntriesForUserQuery(
  string UserId,
  Guid? ProjectId = null,
  DateOnly? StartDate = null,
  DateOnly? EndDate = null
) : IQuery<GetTimeEntriesForUserResult>;

public record GetTimeEntriesForUserResult(List<TimeEntry> TimeEntries);

public class GetTimeEntriesForUserHandler(ApplicationDbContext dbContext)
  : IQueryHandler<GetTimeEntriesForUserQuery, GetTimeEntriesForUserResult>
{
  public async Task<GetTimeEntriesForUserResult> HandleAsync(
    GetTimeEntriesForUserQuery query,
    CancellationToken cancellationToken = default
  )
  {
    var today = DateOnly.FromDateTime(DateTime.Today);
    var startDate = query.StartDate ?? new DateOnly(today.Year, today.Month, 1).AddMonths(-1);
    var endDate = query.EndDate ?? new DateOnly(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month));

    var queryable = dbContext.TimeEntries.AsQueryable().Where(te => te.UserId == query.UserId);

    if (query.ProjectId.HasValue)
    {
      queryable = queryable.Where(te => te.ProjectId == query.ProjectId.Value);
    }

    queryable = queryable.Where(te => te.Date >= startDate && te.Date <= endDate);

    var timeEntries = await queryable.ToListAsync(cancellationToken);
    return new GetTimeEntriesForUserResult(timeEntries);
  }
}
