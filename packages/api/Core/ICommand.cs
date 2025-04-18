namespace Api;

/// <summary>
/// Marker interface for commands in CQRS pattern.
/// Commands represent operations that change state.
/// </summary>
public interface ICommand { }

/// <summary>
/// Marker interface for commands in CQRS pattern.
/// Commands represent operations that change state.
/// </summary>
/// <typeparam name="TResult">The type of result returned by the command</typeparam>
public interface ICommand<TResult> { }
