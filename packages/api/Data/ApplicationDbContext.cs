using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
  public DbSet<Client> Clients { get; set; } = null!;
  public DbSet<Project> Projects { get; set; } = null!;
  public DbSet<TimeEntry> TimeEntries { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    // Configure the relationship between Client and Project
    modelBuilder.Entity<Client>().HasMany(c => c.Projects).WithOne().HasForeignKey(p => p.ClientId);

    // Fix the ClientId type to match between Project and Client
    modelBuilder.Entity<Project>().Property(p => p.ClientId).HasConversion<Guid>();
  }
}
