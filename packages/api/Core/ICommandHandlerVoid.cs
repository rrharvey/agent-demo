namespace Api;

/// <summary>
/// Interface for command handlers in CQRS pattern that don't return a result.
/// These handlers process commands that perform actions without returning data.
/// </summary>
/// <typeparam name="TCommand">The command type</typeparam>
public interface ICommandHandler<TCommand>
  where TCommand : ICommand
{
  /// <summary>
  /// Handles the specified command.
  /// </summary>
  /// <param name="command">The command to handle</param>
  /// <param name="cancellationToken">Cancellation token</param>
  /// <returns>A task representing the asynchronous operation</returns>
  Task HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}
