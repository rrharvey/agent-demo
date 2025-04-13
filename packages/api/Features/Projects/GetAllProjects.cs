using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Projects;

public record GetAllProjectsQuery() : IQuery<GetAllProjectsResponse>;

public record ProjectDto(Guid ProjectId, string ProjectName, string ClientName);

public record GetAllProjectsResponse(List<ProjectDto> Projects);

public class GetAllProjectsHandler(ApplicationDbContext dbContext)
  : IQueryHandler<GetAllProjectsQuery, GetAllProjectsResponse>
{
  public async Task<GetAllProjectsResponse> HandleAsync(
    GetAllProjectsQuery query,
    CancellationToken cancellationToken = default
  )
  {
    var projects = await dbContext
      .Projects.Join(
        dbContext.Clients,
        project => project.ClientId,
        client => client.Id,
        (project, client) => new ProjectDto(project.Id, project.Name, client.Name)
      )
      .ToListAsync(cancellationToken);

    return new GetAllProjectsResponse(projects);
  }
}
