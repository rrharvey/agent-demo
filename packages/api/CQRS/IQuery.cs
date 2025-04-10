namespace Api.CQRS;

/// <summary>
/// Marker interface for queries in CQRS pattern.
/// Queries represent operations that retrieve data without causing state changes.
/// </summary>
/// <typeparam name="TResult">The type of result returned by the query</typeparam>
public interface IQuery<TResult> { }
