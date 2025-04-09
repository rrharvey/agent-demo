namespace api.Endpoints;

/// <summary>
/// Interface for endpoint registration.
/// Implementations will be automatically discovered and registered during startup.
/// </summary>
public interface IEndpointMapper
{
  /// <summary>
  /// Registers the endpoints with the WebApplication.
  /// </summary>
  /// <param name="app">The WebApplication instance to register endpoints with.</param>
  void MapEndpoints(WebApplication app);
}
