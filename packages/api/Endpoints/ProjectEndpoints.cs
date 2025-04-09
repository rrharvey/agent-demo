using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class ProjectEndpoints : IEndpointMapper
{
    public void MapEndpoints(WebApplication app)
    {
        app.MapGet("/api/projects", async (ApplicationDbContext db) => 
            await db.Projects
                .Include(p => p.Client)
                .Select(p => new ProjectDto(
                    p.Id, p.Name, p.Description, p.IsActive, 
                    p.ClientId, p.Client != null ? p.Client.Name : string.Empty, p.CreatedAt))
                .ToListAsync());

        app.MapGet("/api/projects/{id}", async (int id, ApplicationDbContext db) =>
        {
            var project = await db.Projects
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            return project is Project p
                ? Results.Ok(new ProjectDto(
                    p.Id, p.Name, p.Description, p.IsActive, 
                    p.ClientId, p.Client != null ? p.Client.Name : string.Empty, p.CreatedAt))
                : Results.NotFound();
        });

        app.MapPost("/api/projects", async (CreateProjectDto projectDto, ApplicationDbContext db) =>
        {
            var client = await db.Clients.FindAsync(projectDto.ClientId);
            if (client is null) return Results.BadRequest("Invalid client ID");
            
            var project = new Project
            {
                Name = projectDto.Name,
                Description = projectDto.Description,
                ClientId = projectDto.ClientId
            };
            
            db.Projects.Add(project);
            await db.SaveChangesAsync();
            
            return Results.Created($"/api/projects/{project.Id}", 
                new ProjectDto(
                    project.Id, project.Name, project.Description, project.IsActive, 
                    project.ClientId, client.Name, project.CreatedAt));
        });

        app.MapPut("/api/projects/{id}", async (int id, UpdateProjectDto projectDto, ApplicationDbContext db) =>
        {
            var project = await db.Projects.FindAsync(id);
            if (project is null) return Results.NotFound();

            var client = await db.Clients.FindAsync(projectDto.ClientId);
            if (client is null) return Results.BadRequest("Invalid client ID");

            project.Name = projectDto.Name;
            project.Description = projectDto.Description;
            project.IsActive = projectDto.IsActive;
            project.ClientId = projectDto.ClientId;
            
            await db.SaveChangesAsync();
            
            return Results.Ok(
                new ProjectDto(
                    project.Id, project.Name, project.Description, project.IsActive, 
                    project.ClientId, client.Name, project.CreatedAt));
        });

        app.MapDelete("/api/projects/{id}", async (int id, ApplicationDbContext db) =>
        {
            var project = await db.Projects.FindAsync(id);
            if (project is null) return Results.NotFound();
            
            db.Projects.Remove(project);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Get projects by client ID
        app.MapGet("/api/clients/{clientId}/projects", async (int clientId, ApplicationDbContext db) =>
        {
            var client = await db.Clients.FindAsync(clientId);
            if (client is null) return Results.NotFound();

            var projects = await db.Projects
                .Where(p => p.ClientId == clientId)
                .Select(p => new ProjectDto(
                    p.Id, p.Name, p.Description, p.IsActive, 
                    p.ClientId, client.Name, p.CreatedAt))
                .ToListAsync();
                
            return Results.Ok(projects);
        });
    }
}