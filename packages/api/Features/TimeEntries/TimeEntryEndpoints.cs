using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.TimeEntries;

public class TimeEntryEndpoints : EndpointGroupBase
{
  public TimeEntryEndpoints()
    : base("time-entries") { }

  public override void Map(RouteGroupBuilder api)
  {
    // GET /time-entries - Get time entries for a user
    api.MapGet("/", GetTimeEntriesForUser)
      .WithName("GetTimeEntriesForUser")
      .WithDescription("Retrieves all time entries for a specific user")
      .Produces<List<TimeEntry>>(StatusCodes.Status200OK)
      .Produces(StatusCodes.Status400BadRequest);

    // POST /time-entries - Create a new time entry
    api.MapPost("/", CreateTimeEntry)
      .WithName("CreateTimeEntry")
      .WithDescription("Creates a new time entry")
      .Produces<TimeEntry>(StatusCodes.Status201Created)
      .Produces(StatusCodes.Status400BadRequest);

    // PUT /time-entries/{id} - Update a time entry
    api.MapPut("/{id}", UpdateTimeEntry)
      .WithName("UpdateTimeEntry")
      .WithDescription("Updates an existing time entry")
      .Produces<TimeEntry>(StatusCodes.Status200OK)
      .Produces(StatusCodes.Status404NotFound)
      .Produces(StatusCodes.Status400BadRequest);

    // DELETE /time-entries/{id} - Delete a time entry
    api.MapDelete("/{id}", DeleteTimeEntry)
      .WithName("DeleteTimeEntry")
      .WithDescription("Deletes a time entry")
      .Produces(StatusCodes.Status204NoContent)
      .Produces(StatusCodes.Status404NotFound);
  }

  private async Task<Results<Ok<List<TimeEntry>>, BadRequest<string>>> GetTimeEntriesForUser(
    [FromQuery] string userId,
    [FromQuery] Guid? projectId = null,
    [FromQuery] DateOnly? startDate = null,
    [FromQuery] DateOnly? endDate = null,
    [FromServices] IQueryHandler<GetTimeEntriesForUserQuery, List<TimeEntry>> handler = null!,
    CancellationToken cancellationToken = default
  )
  {
    if (string.IsNullOrEmpty(userId))
    {
      return TypedResults.BadRequest("UserId is required");
    }

    var query = new GetTimeEntriesForUserQuery(userId, projectId, startDate, endDate);
    var result = await handler.HandleAsync(query, cancellationToken);
    return TypedResults.Ok(result);
  }

  private async Task<Results<Created<TimeEntry>, BadRequest<string>>> CreateTimeEntry(
    [FromBody] CreateTimeEntryCommand command,
    [FromServices] ICommandHandler<CreateTimeEntryCommand, TimeEntry> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var result = await handler.HandleAsync(command, cancellationToken);
      return TypedResults.Created($"/time-entries/{result.Id}", result);
    }
    catch (Exception ex)
    {
      return TypedResults.BadRequest(ex.Message);
    }
  }

  private async Task<Results<Ok<TimeEntry>, NotFound, BadRequest<string>>> UpdateTimeEntry(
    [FromRoute] int id,
    [FromBody] UpdateTimeEntryCommand command,
    [FromServices] ICommandHandler<UpdateTimeEntryCommand, TimeEntry?> handler,
    CancellationToken cancellationToken
  )
  {
    if (id != command.Id)
    {
      return TypedResults.BadRequest("ID in route must match ID in body");
    }

    try
    {
      var result = await handler.HandleAsync(command, cancellationToken);

      if (result is null)
      {
        return TypedResults.NotFound();
      }

      return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
      return TypedResults.BadRequest(ex.Message);
    }
  }

  private async Task<Results<NoContent, NotFound>> DeleteTimeEntry(
    [FromRoute] int id,
    [FromServices] ICommandHandler<DeleteTimeEntryCommand, bool> handler,
    CancellationToken cancellationToken
  )
  {
    var command = new DeleteTimeEntryCommand(id);
    var result = await handler.HandleAsync(command, cancellationToken);

    if (!result)
    {
      return TypedResults.NotFound();
    }

    return TypedResults.NoContent();
  }
}
