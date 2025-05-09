namespace Api;

/// <summary>
/// Interface for query handlers in CQRS pattern.
/// Query handlers process queries and return results.
/// </summary>
/// <typeparam name="TQuery">The query type</typeparam>
/// <typeparam name="TResult">The result type</typeparam>
public interface IQueryHandler<TQuery, TResult>
  where TQuery : IQuery<TResult>
{
  /// <summary>
  /// Handles the specified query.
  /// </summary>
  /// <param name="query">The query to handle</param>
  /// <param name="cancellationToken">Cancellation token</param>
  /// <returns>The result of handling the query</returns>
  Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken = default);
}

/// <summary>
/// Interface for parameterized query handlers in CQRS pattern.
/// Parameterized query handlers process queries with additional parameters and return results.
/// </summary>
/// <typeparam name="TQuery">The query type</typeparam>
/// <typeparam name="TParams">The parameters type</typeparam>
/// <typeparam name="TResult">The result type</typeparam>
public interface IQueryHandler<TQuery, TParams, TResult>
  where TQuery : IQuery<TResult>
{
  /// <summary>
  /// Handles the specified query with parameters.
  /// </summary>
  /// <param name="query">The query to handle</param>
  /// <param name="parameters">The parameters for the query</param>
  /// <param name="cancellationToken">Cancellation token</param>
  /// <returns>The result of handling the query</returns>
  Task<TResult> HandleAsync(TQuery query, TParams parameters, CancellationToken cancellationToken = default);
}
