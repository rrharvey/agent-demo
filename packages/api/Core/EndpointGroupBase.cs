namespace Api;

/// <summary>
/// Base class for endpoint groups.
/// </summary>
/// <param name="path">The base path for the endpoint group.</param>
public abstract class EndpointGroupBase(string path)
{
  public string Path { get; } = path;

  public abstract void Map(WebApplication app);
}
