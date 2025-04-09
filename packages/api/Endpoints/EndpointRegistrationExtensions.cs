using System.Reflection;

namespace api.Endpoints;

public static class EndpointRegistrationExtensions
{
    /// <summary>
    /// Registers all endpoints from classes implementing IEndpointMapper in the executing assembly.
    /// </summary>
    /// <param name="app">The WebApplication instance to register endpoints with.</param>
    public static void RegisterAllEndpoints(this WebApplication app)
    {
        var endpointRegistrationTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => !t.IsAbstract && !t.IsInterface && typeof(IEndpointMapper).IsAssignableFrom(t))
            .ToList();

        foreach (var type in endpointRegistrationTypes)
        {
            if (Activator.CreateInstance(type) is IEndpointMapper registration)
            {
                registration.MapEndpoints(app);
            }
        }
    }
}