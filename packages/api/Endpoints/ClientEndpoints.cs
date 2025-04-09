using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public class ClientEndpoints : IEndpointMapper
{
  public void MapEndpoints(WebApplication app)
  {
    app.MapGet(
      "/api/clients",
      async (ApplicationDbContext db) =>
      {
        return Results.Ok(
          await db
            .Clients.Select(c => new ClientDto(
              c.Id,
              c.Name,
              c.Description,
              c.IsActive,
              c.CreatedAt
            ))
            .ToListAsync()
        );
      }
    );

    app.MapGet(
      "/api/clients/{id}",
      async (int id, ApplicationDbContext db) =>
      {
        return await db.Clients.FindAsync(id) is Client client
          ? Results.Ok(
            new ClientDto(
              client.Id,
              client.Name,
              client.Description,
              client.IsActive,
              client.CreatedAt
            )
          )
          : Results.NotFound();
      }
    );

    app.MapPost(
      "/api/clients",
      async (CreateClientDto clientDto, ApplicationDbContext db) =>
      {
        var client = new Client { Name = clientDto.Name, Description = clientDto.Description };

        db.Clients.Add(client);
        await db.SaveChangesAsync();

        return Results.Created(
          $"/api/clients/{client.Id}",
          new ClientDto(
            client.Id,
            client.Name,
            client.Description,
            client.IsActive,
            client.CreatedAt
          )
        );
      }
    );

    app.MapPut(
      "/api/clients/{id}",
      async (int id, UpdateClientDto clientDto, ApplicationDbContext db) =>
      {
        var client = await db.Clients.FindAsync(id);
        if (client is null)
          return Results.NotFound();

        client.Name = clientDto.Name;
        client.Description = clientDto.Description;
        client.IsActive = clientDto.IsActive;

        await db.SaveChangesAsync();
        return Results.Ok(
          new ClientDto(
            client.Id,
            client.Name,
            client.Description,
            client.IsActive,
            client.CreatedAt
          )
        );
      }
    );

    app.MapDelete(
      "/api/clients/{id}",
      async (int id, ApplicationDbContext db) =>
      {
        var client = await db.Clients.FindAsync(id);
        if (client is null)
          return Results.NotFound();

        db.Clients.Remove(client);
        await db.SaveChangesAsync();
        return Results.NoContent();
      }
    );
  }
}
