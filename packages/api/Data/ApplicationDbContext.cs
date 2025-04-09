using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<TimeEntry> TimeEntries { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Client)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.ClientId);

        modelBuilder.Entity<TimeEntry>()
            .HasOne(t => t.Project)
            .WithMany(p => p.TimeEntries)
            .HasForeignKey(t => t.ProjectId);

        // Seed some initial data
        modelBuilder.Entity<Client>().HasData(
            new Client { Id = 1, Name = "Acme Corp", Description = "Technology solutions provider", IsActive = true, CreatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, Name = "Website Redesign", Description = "Corporate website overhaul", ClientId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
        );

        base.OnModelCreating(modelBuilder);
    }
}