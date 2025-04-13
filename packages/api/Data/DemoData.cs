using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api;

internal static class DemoData
{
  public static void SeedData(DbContext context, bool _)
  {
    if (context.Set<Client>().Any())
    {
      return; // Database already seeded
    }

    // Create 10 clients for a software consulting company
    var clients = new List<Client>
    {
      new() { Id = Guid.NewGuid(), Name = "TechSolutions Inc." },
      new() { Id = Guid.NewGuid(), Name = "Innovate Systems" },
      new() { Id = Guid.NewGuid(), Name = "Digital Frontier" },
      new() { Id = Guid.NewGuid(), Name = "NextGen Software" },
      new() { Id = Guid.NewGuid(), Name = "CloudWave Technologies" },
      new() { Id = Guid.NewGuid(), Name = "Agile Dynamics" },
      new() { Id = Guid.NewGuid(), Name = "BrightPath Data" },
      new() { Id = Guid.NewGuid(), Name = "CoreLogic Systems" },
      new() { Id = Guid.NewGuid(), Name = "MobileFirst Enterprises" },
      new() { Id = Guid.NewGuid(), Name = "SmartFlow Solutions" },
      new() { Id = Guid.NewGuid(), Name = "Intertech" },
    };

    context.Set<Client>().AddRange(clients);
    context.SaveChanges();

    // Create projects for clients (20% with 2 projects, the rest with 1)
    var projects = new List<Project>
    {
      // 2 clients (20%) with 2 projects each
      // Client 1 with 2 projects
      new()
      {
        Id = Guid.NewGuid(),
        Name = "E-commerce Platform Redesign",
        ClientId = clients[0].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Mobile App Development",
        ClientId = clients[0].Id,
      },
      // Client 2 with 2 projects
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Cloud Migration Strategy",
        ClientId = clients[1].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "DevOps Pipeline Implementation",
        ClientId = clients[1].Id,
      },
      // Remaining clients with 1 project each
      new()
      {
        Id = Guid.NewGuid(),
        Name = "AI-Powered Customer Portal",
        ClientId = clients[2].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Enterprise CRM Integration",
        ClientId = clients[3].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Microservices Architecture Refactoring",
        ClientId = clients[4].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Data Analytics Dashboard",
        ClientId = clients[5].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Security Compliance System",
        ClientId = clients[6].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "IoT Monitoring Solution",
        ClientId = clients[7].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Cross-Platform Mobile Framework",
        ClientId = clients[8].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Blockchain Supply Chain Tracking",
        ClientId = clients[9].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Paid Time Off",
        ClientId = clients[10].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Bench",
        ClientId = clients[10].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Holiday",
        ClientId = clients[10].Id,
      },
      new()
      {
        Id = Guid.NewGuid(),
        Name = "Administrative",
        ClientId = clients[10].Id,
      },
    };

    context.Set<Project>().AddRange(projects);
    context.SaveChanges();
  }
}
