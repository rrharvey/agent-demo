using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class ClientEndpoints : IEndpointMapper
{
    public void MapEndpoints(WebApplication app)
    {
        app.MapGet("/api/clients", GetClients);
        app.MapGet("/api/clients/{id}", GetClientById);
        app.MapPost("/api/clients", CreateClient);
        app.MapPut("/api/clients/{id}", UpdateClient);
        app.MapDelete("/api/clients/{id}", DeleteClient);
    }

    private static async Task<IResult> GetClients(ApplicationDbContext db)
    {
        return Results.Ok(await db.Clients
            .Select(c => new ClientDto(c.Id, c.Name, c.Description, c.IsActive, c.CreatedAt))
            .ToListAsync());
    }

    private static async Task<IResult> GetClientById(int id, ApplicationDbContext db)
    {
        return await db.Clients.FindAsync(id) is Client client
            ? Results.Ok(new ClientDto(client.Id, client.Name, client.Description, client.IsActive, client.CreatedAt))
            : Results.NotFound();
    }

    private static async Task<IResult> CreateClient(CreateClientDto clientDto, ApplicationDbContext db)
    {
        var client = new Client
        {
            Name = clientDto.Name,
            Description = clientDto.Description,
        };
        
        db.Clients.Add(client);
        await db.SaveChangesAsync();
        
        return Results.Created($"/api/clients/{client.Id}", 
            new ClientDto(client.Id, client.Name, client.Description, client.IsActive, client.CreatedAt));
    }

    private static async Task<IResult> UpdateClient(int id, UpdateClientDto clientDto, ApplicationDbContext db)
    {
        var client = await db.Clients.FindAsync(id);
        if (client is null) return Results.NotFound();

        client.Name = clientDto.Name;
        client.Description = clientDto.Description;
        client.IsActive = clientDto.IsActive;
        
        await db.SaveChangesAsync();
        return Results.Ok(new ClientDto(client.Id, client.Name, client.Description, client.IsActive, client.CreatedAt));
    }

    private static async Task<IResult> DeleteClient(int id, ApplicationDbContext db)
    {
        var client = await db.Clients.FindAsync(id);
        if (client is null) return Results.NotFound();
        
        db.Clients.Remove(client);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}