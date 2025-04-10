namespace Api.CQRS;

/// <summary>
/// Interface for command handlers in CQRS pattern.
/// Command handlers process commands and return results.
/// </summary>
/// <typeparam name="TCommand">The command type</typeparam>
/// <typeparam name="TResult">The result type</typeparam>
public interface ICommandHandler<TCommand, TResult>
  where TCommand : ICommand<TResult>
{
  /// <summary>
  /// Handles the specified command.
  /// </summary>
  /// <param name="command">The command to handle</param>
  /// <returns>The result of handling the command</returns>
  Task<TResult> HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}
