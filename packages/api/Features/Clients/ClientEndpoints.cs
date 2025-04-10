using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Clients;

public class ClientsEndpoints : EndpointGroupBase
{
  public ClientsEndpoints()
    : base("clients") { }

  public override void Map(RouteGroupBuilder api)
  {
    // GET /clients - Get all clients
    api.MapGet("/", GetAllClients)
      .WithName("GetAllClients")
      .WithDescription("Retrieves all clients with their projects")
      .Produces<GetAllClientsResponse>(StatusCodes.Status200OK);
  }

  private async Task<Results<Ok<GetAllClientsResponse>, ProblemHttpResult>> GetAllClients(
    [FromServices] IQueryHandler<GetAllClientsQuery, GetAllClientsResponse> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var result = await handler.HandleAsync(new GetAllClientsQuery(), cancellationToken);
      return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
      return TypedResults.Problem(ex.Message);
    }
  }
}
