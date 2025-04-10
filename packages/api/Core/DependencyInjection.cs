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
    // Register command handlers with results: ICommandHandler<,>
    RegisterHandlersForInterface(services, assembly, typeof(ICommandHandler<,>));

    // Register command handlers without results: ICommandHandler<>
    RegisterHandlersForInterface(services, assembly, typeof(ICommandHandler<>), typeof(ICommandHandler<,>));

    // Register query handlers: IQueryHandler<,>
    RegisterHandlersForInterface(services, assembly, typeof(IQueryHandler<,>));

    return services;
  }

  /// <summary>
  /// Helper method to register handlers for a specific interface type
  /// </summary>
  private static void RegisterHandlersForInterface(
    IServiceCollection services,
    Assembly assembly,
    Type handlerInterfaceType,
    Type? excludeGeneric = null
  )
  {
    // Only load types that actually implement the target interface
    var handlerTypes = assembly
      .GetTypes()
      .Where(t =>
        !t.IsAbstract
        && !t.IsInterface
        && t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == handlerInterfaceType)
      );

    // Further filter if we need to exclude certain interface implementations
    if (excludeGeneric != null)
    {
      handlerTypes = handlerTypes.Where(t =>
        !t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == excludeGeneric)
      );
    }

    // Register all matching handlers
    foreach (var handlerType in handlerTypes)
    {
      var interfaceType = handlerType
        .GetInterfaces()
        .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == handlerInterfaceType);

      services.AddScoped(interfaceType, handlerType);
    }
  }
}
