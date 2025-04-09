using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class TimeEntryEndpoints : IEndpointMapper
{
    public void MapEndpoints(WebApplication app)
    {
        app.MapGet("/api/time-entries", async (ApplicationDbContext db) => 
            await db.TimeEntries
                .Include(t => t.Project)
                    .ThenInclude(p => p!.Client)
                .Select(t => new TimeEntryDto(
                    t.Id, t.Description, t.StartTime, t.EndTime, 
                    t.ProjectId, t.Project != null ? t.Project.Name : string.Empty, 
                    t.Project != null && t.Project.Client != null ? t.Project.Client.Name : string.Empty,
                    t.UserId, t.UserName, t.IsBillable, t.CreatedAt,
                    t.EndTime.HasValue ? t.EndTime.Value - t.StartTime : null))
                .ToListAsync());

        app.MapGet("/api/time-entries/{id}", async (int id, ApplicationDbContext db) =>
        {
            var entry = await db.TimeEntries
                .Include(t => t.Project)
                    .ThenInclude(p => p!.Client)
                .FirstOrDefaultAsync(t => t.Id == id);
                
            return entry is TimeEntry t
                ? Results.Ok(new TimeEntryDto(
                    t.Id, t.Description, t.StartTime, t.EndTime, 
                    t.ProjectId, t.Project != null ? t.Project.Name : string.Empty, 
                    t.Project != null && t.Project.Client != null ? t.Project.Client.Name : string.Empty,
                    t.UserId, t.UserName, t.IsBillable, t.CreatedAt,
                    t.EndTime.HasValue ? t.EndTime.Value - t.StartTime : null))
                : Results.NotFound();
        });

        app.MapPost("/api/time-entries", async (CreateTimeEntryDto entryDto, ApplicationDbContext db) =>
        {
            var project = await db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == entryDto.ProjectId);
            if (project is null) return Results.BadRequest("Invalid project ID");
            
            var entry = new TimeEntry
            {
                Description = entryDto.Description,
                StartTime = entryDto.StartTime,
                EndTime = entryDto.EndTime,
                ProjectId = entryDto.ProjectId,
                UserId = entryDto.UserId,
                UserName = entryDto.UserName,
                IsBillable = entryDto.IsBillable
            };
            
            db.TimeEntries.Add(entry);
            await db.SaveChangesAsync();
            
            return Results.Created($"/api/time-entries/{entry.Id}", 
                new TimeEntryDto(
                    entry.Id, entry.Description, entry.StartTime, entry.EndTime, 
                    entry.ProjectId, project.Name, 
                    project.Client != null ? project.Client.Name : string.Empty,
                    entry.UserId, entry.UserName, entry.IsBillable, entry.CreatedAt,
                    entry.EndTime.HasValue ? entry.EndTime.Value - entry.StartTime : null));
        });

        app.MapPut("/api/time-entries/{id}", async (int id, UpdateTimeEntryDto entryDto, ApplicationDbContext db) =>
        {
            var entry = await db.TimeEntries.FindAsync(id);
            if (entry is null) return Results.NotFound();

            var project = await db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == entryDto.ProjectId);
            if (project is null) return Results.BadRequest("Invalid project ID");

            entry.Description = entryDto.Description;
            entry.StartTime = entryDto.StartTime;
            entry.EndTime = entryDto.EndTime;
            entry.ProjectId = entryDto.ProjectId;
            entry.UserId = entryDto.UserId;
            entry.UserName = entryDto.UserName;
            entry.IsBillable = entryDto.IsBillable;
            
            await db.SaveChangesAsync();
            
            return Results.Ok(
                new TimeEntryDto(
                    entry.Id, entry.Description, entry.StartTime, entry.EndTime, 
                    entry.ProjectId, project.Name, 
                    project.Client != null ? project.Client.Name : string.Empty,
                    entry.UserId, entry.UserName, entry.IsBillable, entry.CreatedAt,
                    entry.EndTime.HasValue ? entry.EndTime.Value - entry.StartTime : null));
        });

        app.MapDelete("/api/time-entries/{id}", async (int id, ApplicationDbContext db) =>
        {
            var entry = await db.TimeEntries.FindAsync(id);
            if (entry is null) return Results.NotFound();
            
            db.TimeEntries.Remove(entry);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Get time entries by project
        app.MapGet("/api/projects/{projectId}/time-entries", async (int projectId, ApplicationDbContext db) =>
        {
            var project = await db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == projectId);
            if (project is null) return Results.NotFound();

            var entries = await db.TimeEntries
                .Where(t => t.ProjectId == projectId)
                .Select(t => new TimeEntryDto(
                    t.Id, t.Description, t.StartTime, t.EndTime, 
                    t.ProjectId, project.Name, 
                    project.Client != null ? project.Client.Name : string.Empty,
                    t.UserId, t.UserName, t.IsBillable, t.CreatedAt,
                    t.EndTime.HasValue ? t.EndTime.Value - t.StartTime : null))
                .ToListAsync();
                
            return Results.Ok(entries);
        });

        // Start a new time entry (current time as start)
        app.MapPost("/api/time-entries/start", async (CreateTimeEntryDto entryDto, ApplicationDbContext db) =>
        {
            var project = await db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == entryDto.ProjectId);
            if (project is null) return Results.BadRequest("Invalid project ID");
            
            // Set start time to now if not provided
            var startTime = entryDto.StartTime == default ? DateTime.UtcNow : entryDto.StartTime;
            
            var entry = new TimeEntry
            {
                Description = entryDto.Description,
                StartTime = startTime,
                EndTime = null, // No end time yet as it's ongoing
                ProjectId = entryDto.ProjectId,
                UserId = entryDto.UserId,
                UserName = entryDto.UserName,
                IsBillable = entryDto.IsBillable
            };
            
            db.TimeEntries.Add(entry);
            await db.SaveChangesAsync();
            
            return Results.Created($"/api/time-entries/{entry.Id}", 
                new TimeEntryDto(
                    entry.Id, entry.Description, entry.StartTime, entry.EndTime, 
                    entry.ProjectId, project.Name, 
                    project.Client != null ? project.Client.Name : string.Empty,
                    entry.UserId, entry.UserName, entry.IsBillable, entry.CreatedAt, null));
        });

        // Stop a time entry (set end time to current time)
        app.MapPut("/api/time-entries/{id}/stop", async (int id, ApplicationDbContext db) =>
        {
            var entry = await db.TimeEntries
                .Include(t => t.Project)
                .ThenInclude(p => p!.Client)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            if (entry is null) return Results.NotFound();
            if (entry.EndTime != null) return Results.BadRequest("Time entry is already stopped");

            entry.EndTime = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(
                new TimeEntryDto(
                    entry.Id, entry.Description, entry.StartTime, entry.EndTime, 
                    entry.ProjectId, 
                    entry.Project != null ? entry.Project.Name : string.Empty, 
                    entry.Project != null && entry.Project.Client != null ? entry.Project.Client.Name : string.Empty,
                    entry.UserId, entry.UserName, entry.IsBillable, entry.CreatedAt,
                    entry.EndTime.Value - entry.StartTime));
        });
    }
}