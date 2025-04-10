using System.Reflection;
using Api;

namespace Microsoft.Extensions.DependencyInjection;

/// <summary>
/// Extension methods for CQRS service registration
/// </summary>
public static class DependencyInjection
{
  /// <summary>
  /// Registers all command and query handlers in the assembly containing the specified marker type.
  /// </summary>
  /// <param name="services">The service collection</param>
  /// <returns>The service collection for chaining</returns>
  public static IServiceCollection AddCqrs(this IServiceCollection services)
  {
    return services.AddCqrs(Assembly.GetExecutingAssembly());
  }

  /// <summary>
  /// Registers all command and query handlers in the specified assembly.
  /// </summary>
  /// <param name="services">The service collection</param>
  /// <param name="assembly">The assembly to scan for handlers</param>
  /// <returns>The service collection for chaining</returns>
  public static IServiceCollection AddCqrs(this IServiceCollection services, Assembly assembly)
  {
    // Register Command Handlers
    var commandHandlerTypes = assembly
      .GetTypes()
      .Where(t =>
        !t.IsAbstract
        && !t.IsInterface
        && t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>))
      );

    foreach (var handlerType in commandHandlerTypes)
    {
      var interfaceType = handlerType
        .GetInterfaces()
        .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>));

      services.AddScoped(interfaceType, handlerType);
    }

    // Register Query Handlers
    var queryHandlerTypes = assembly
      .GetTypes()
      .Where(t =>
        !t.IsAbstract
        && !t.IsInterface
        && t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>))
      );

    foreach (var handlerType in queryHandlerTypes)
    {
      var interfaceType = handlerType
        .GetInterfaces()
        .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>));

      services.AddScoped(interfaceType, handlerType);
    }

    return services;
  }
}
