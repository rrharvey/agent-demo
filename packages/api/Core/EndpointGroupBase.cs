namespace Api;

/// <summary>
/// Base class for endpoint groups.
/// </summary>
/// <param name="path">The base path for the endpoint group.</param>
public abstract class EndpointGroupBase(string path)
{
  public string Path { get; } = path;

  public void Map(WebApplication app)
  {
    var group = app.MapGroup($"/{Path}").WithTags(Path);
    Map(group);
  }

  public abstract void Map(RouteGroupBuilder api);
}
