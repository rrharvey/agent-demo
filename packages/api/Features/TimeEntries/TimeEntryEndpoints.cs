using System.ComponentModel;
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
      .WithDescription("Retrieves time entries for a user with optional filtering by project and date range")
      .Produces<GetTimeEntriesForUserResult>(StatusCodes.Status200OK)
      .Produces(StatusCodes.Status400BadRequest);

    // GET /time-entries/{id} - Get a time entry by ID
    api.MapGet("/{id}", GetTimeEntryById)
      .WithName("GetTimeEntryById")
      .WithDescription("Retrieves a single time entry by ID")
      .Produces<GetTimeEntryByIdResult>(StatusCodes.Status200OK)
      .Produces(StatusCodes.Status404NotFound)
      .Produces(StatusCodes.Status400BadRequest);

    // POST /time-entries - Create a new time entry
    api.MapPost("/", CreateTimeEntry)
      .WithName("CreateTimeEntry")
      .WithDescription("Creates a new time entry")
      .Produces<TimeEntry>(StatusCodes.Status201Created)
      .Produces(StatusCodes.Status400BadRequest);

    // PUT /time-entries/{id} - Update an existing time entry
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
      .Produces(StatusCodes.Status404NotFound)
      .Produces(StatusCodes.Status400BadRequest);
  }

  private async Task<Results<Ok<GetTimeEntriesForUserResult>, BadRequest<string>>> GetTimeEntriesForUser(
    [FromQuery] string userId,
    [FromQuery] Guid? projectId = null,
    [FromQuery] [Description("Defaults to the first day of the previous month.")] DateOnly? startDate = null,
    [FromQuery] [Description("Defaults to the last day of the current month.")] DateOnly? endDate = null,
    [FromServices] IQueryHandler<GetTimeEntriesForUserQuery, GetTimeEntriesForUserResult> handler = null!,
    CancellationToken cancellationToken = default
  )
  {
    try
    {
      var query = new GetTimeEntriesForUserQuery(userId, projectId, startDate, endDate);
      var result = await handler.HandleAsync(query, cancellationToken);
      return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
      return TypedResults.BadRequest(ex.Message);
    }
  }

  private async Task<Results<Ok<GetTimeEntryByIdResult>, NotFound, BadRequest<string>>> GetTimeEntryById(
    [FromRoute] int id,
    [FromServices] IQueryHandler<GetTimeEntryByIdQuery, GetTimeEntryByIdResult> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var query = new GetTimeEntryByIdQuery(id);
      var result = await handler.HandleAsync(query, cancellationToken);

      if (result.TimeEntry == null)
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

  private async Task<Results<Created<TimeEntry>, BadRequest<string>>> CreateTimeEntry(
    [FromBody] CreateTimeEntryCommand command,
    [FromServices] ICommandHandler<CreateTimeEntryCommand, TimeEntry> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var result = await handler.HandleAsync(command, cancellationToken);
      return TypedResults.Created($"/time-entries?userId={result.UserId}", result);
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
    try
    {
      if (id != command.Id)
      {
        return TypedResults.BadRequest("ID in route must match ID in request body");
      }

      var result = await handler.HandleAsync(command, cancellationToken);

      if (result == null)
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

  private async Task<Results<NoContent, NotFound, BadRequest<string>>> DeleteTimeEntry(
    [FromRoute] int id,
    [FromServices] ICommandHandler<DeleteTimeEntryCommand, bool> handler,
    CancellationToken cancellationToken
  )
  {
    try
    {
      var result = await handler.HandleAsync(new DeleteTimeEntryCommand(id), cancellationToken);

      if (!result)
      {
        return TypedResults.NotFound();
      }

      return TypedResults.NoContent();
    }
    catch (Exception ex)
    {
      return TypedResults.BadRequest(ex.Message);
    }
  }
}
