using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Projects;

public class ProjectEndpoints : EndpointGroupBase
{
  public ProjectEndpoints()
    : base("projects") { }

  public override void Map(RouteGroupBuilder api)
  {
    // GET /projects - Get all projects
    api.MapGet("/", GetAllProjects)
      .WithName("GetAllProjects")
      .WithDescription("Retrieves all projects with their client information")
      .Produces<GetAllProjectsResponse>(StatusCodes.Status200OK);
  }

  private async Task<Results<Ok<GetAllProjectsResponse>, ProblemHttpResult>> GetAllProjects(
    [FromServices] IQueryHandler<GetAllProjectsQuery, GetAllProjectsResponse> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var result = await handler.HandleAsync(new GetAllProjectsQuery(), cancellationToken);
      return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
      return TypedResults.Problem(ex.Message);
    }
  }
}
