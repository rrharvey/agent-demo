using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class ReportingEndpoints : IEndpointMapper
{
  public void MapEndpoints(WebApplication app)
  {
    // Get time entries filtered by date range
    app.MapGet(
      "/api/reports/time-entries",
      async (
        ApplicationDbContext db,
        DateTime? startDate,
        DateTime? endDate,
        int? projectId,
        int? clientId,
        string? userId,
        bool? isBillable
      ) =>
      {
        var query = db
          .TimeEntries.Include(t => t.Project)
          .ThenInclude(p => p!.Client)
          .AsQueryable();

        if (startDate != null)
          query = query.Where(t => t.StartTime >= startDate);

        if (endDate != null)
          query = query.Where(t => t.StartTime <= endDate);

        if (projectId != null)
          query = query.Where(t => t.ProjectId == projectId);

        if (clientId != null)
          query = query.Where(t => t.Project!.ClientId == clientId);

        if (userId != null)
          query = query.Where(t => t.UserId == userId);

        if (isBillable != null)
          query = query.Where(t => t.IsBillable == isBillable);

        var entries = await query
          .Select(t => new TimeEntryDto(
            t.Id,
            t.Description,
            t.StartTime,
            t.EndTime,
            t.ProjectId,
            t.Project != null ? t.Project.Name : string.Empty,
            t.Project != null && t.Project.Client != null ? t.Project.Client.Name : string.Empty,
            t.UserId,
            t.UserName,
            t.IsBillable,
            t.CreatedAt,
            t.EndTime.HasValue ? t.EndTime.Value - t.StartTime : null
          ))
          .ToListAsync();

        return Results.Ok(entries);
      }
    );

    // Get summary by project
    app.MapGet(
      "/api/reports/summary/by-project",
      async (ApplicationDbContext db, DateTime? startDate, DateTime? endDate) =>
      {
        var query = db.TimeEntries.Include(t => t.Project).AsQueryable();

        if (startDate != null)
          query = query.Where(t => t.StartTime >= startDate);

        if (endDate != null)
          query = query.Where(t => t.StartTime <= endDate);

        var summaries = await query
          .GroupBy(t => new { t.ProjectId, ProjectName = t.Project!.Name })
          .Select(g => new
          {
            ProjectId = g.Key.ProjectId,
            ProjectName = g.Key.ProjectName,
            TotalEntries = g.Count(),
            TotalHours = g.Sum(t =>
              t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0
            ),
            BillableHours = g.Where(t => t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
            NonBillableHours = g.Where(t => !t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
          })
          .ToListAsync();

        return Results.Ok(summaries);
      }
    );

    // Get summary by client
    app.MapGet(
      "/api/reports/summary/by-client",
      async (ApplicationDbContext db, DateTime? startDate, DateTime? endDate) =>
      {
        var query = db
          .TimeEntries.Include(t => t.Project)
          .ThenInclude(p => p!.Client)
          .AsQueryable();

        if (startDate != null)
          query = query.Where(t => t.StartTime >= startDate);

        if (endDate != null)
          query = query.Where(t => t.StartTime <= endDate);

        var summaries = await query
          .GroupBy(t => new { ClientId = t.Project!.ClientId, ClientName = t.Project.Client!.Name })
          .Select(g => new
          {
            ClientId = g.Key.ClientId,
            ClientName = g.Key.ClientName,
            TotalEntries = g.Count(),
            TotalHours = g.Sum(t =>
              t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0
            ),
            BillableHours = g.Where(t => t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
            NonBillableHours = g.Where(t => !t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
          })
          .ToListAsync();

        return Results.Ok(summaries);
      }
    );

    // Get summary by user
    app.MapGet(
      "/api/reports/summary/by-user",
      async (ApplicationDbContext db, DateTime? startDate, DateTime? endDate) =>
      {
        var query = db.TimeEntries.AsQueryable();

        if (startDate != null)
          query = query.Where(t => t.StartTime >= startDate);

        if (endDate != null)
          query = query.Where(t => t.StartTime <= endDate);

        var summaries = await query
          .GroupBy(t => new { t.UserId, t.UserName })
          .Select(g => new
          {
            UserId = g.Key.UserId,
            UserName = g.Key.UserName,
            TotalEntries = g.Count(),
            TotalHours = g.Sum(t =>
              t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0
            ),
            BillableHours = g.Where(t => t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
            NonBillableHours = g.Where(t => !t.IsBillable)
              .Sum(t => t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalHours : 0),
          })
          .ToListAsync();

        return Results.Ok(summaries);
      }
    );
  }
}
