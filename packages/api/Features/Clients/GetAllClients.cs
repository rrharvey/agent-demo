using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Clients;

public record GetAllClientsQuery() : IQuery<GetAllClientsResponse>;

public record GetAllClientsResponse(List<Client> Clients);

public class GetAllClientsHandler(ApplicationDbContext dbContext)
  : IQueryHandler<GetAllClientsQuery, GetAllClientsResponse>
{
  public async Task<GetAllClientsResponse> HandleAsync(
    GetAllClientsQuery query,
    CancellationToken cancellationToken = default
  )
  {
    var clients = await dbContext.Clients.Include(c => c.Projects).ToListAsync(cancellationToken);

    return new GetAllClientsResponse(clients);
  }
}
