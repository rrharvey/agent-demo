using System.Reflection;

namespace Api;

public static class WebApplicationExtensions
{
  public static WebApplication MapEndpoints(this WebApplication app)
  {
    var endpointGroupType = typeof(EndpointGroupBase);

    var assembly = Assembly.GetExecutingAssembly();

    var endpointGroupTypes = assembly
      .GetExportedTypes()
      .Where(t => t.IsAssignableTo(endpointGroupType) && !t.IsAbstract);

    foreach (var type in endpointGroupTypes)
    {
      if (Activator.CreateInstance(type) is EndpointGroupBase instance)
      {
        instance.Map(app);
      }
    }

    return app;
  }
}
