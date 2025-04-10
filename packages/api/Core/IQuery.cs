namespace Api;

/// <summary>
/// Represents a query.
/// </summary>
/// <typeparam name="TResult">The type of result returned by the query.</typeparam>
public interface IQuery<TResult> { }

/// <summary>
/// Represents a query with parameters.
/// </summary>
/// <typeparam name="TResult">The type of result returned by the query.</typeparam>
/// <typeparam name="TParam">The type of parameters for the query.</typeparam>
public interface IQuery<TResult, TParam> { }
