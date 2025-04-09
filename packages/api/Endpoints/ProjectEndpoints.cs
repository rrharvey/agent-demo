using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class ProjectEndpoints : IEndpointMapper
{
    public void MapEndpoints(WebApplication app)
    {
        app.MapGet("/api/projects", GetProjects);
        app.MapGet("/api/projects/{id}", GetProjectById);
        app.MapPost("/api/projects", CreateProject);
        app.MapPut("/api/projects/{id}", UpdateProject);
        app.MapDelete("/api/projects/{id}", DeleteProject);
        app.MapGet("/api/clients/{clientId}/projects", GetProjectsByClient);
    }

    private static async Task<IResult> GetProjects(ApplicationDbContext db)
    {
        return Results.Ok(await db.Projects
            .Include(p => p.Client)
            .Select(p => new ProjectDto(
                p.Id, p.Name, p.Description, p.IsActive, 
                p.ClientId, p.Client != null ? p.Client.Name : string.Empty, p.CreatedAt))
            .ToListAsync());
    }

    private static async Task<IResult> GetProjectById(int id, ApplicationDbContext db)
    {
        var project = await db.Projects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        return project is Project p
            ? Results.Ok(new ProjectDto(
                p.Id, p.Name, p.Description, p.IsActive, 
                p.ClientId, p.Client != null ? p.Client.Name : string.Empty, p.CreatedAt))
            : Results.NotFound();
    }

    private static async Task<IResult> CreateProject(CreateProjectDto projectDto, ApplicationDbContext db)
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
    }

    private static async Task<IResult> UpdateProject(int id, UpdateProjectDto projectDto, ApplicationDbContext db)
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
    }

    private static async Task<IResult> DeleteProject(int id, ApplicationDbContext db)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return Results.NotFound();
        
        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> GetProjectsByClient(int clientId, ApplicationDbContext db)
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
    }
}