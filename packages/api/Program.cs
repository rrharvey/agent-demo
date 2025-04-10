using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();

// Configure EF Core with SQLite
builder.Services.AddDbContext<Api.Data.ApplicationDbContext>(options =>
  options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=timetracker.db")
);

// Register CQRS handlers
builder.Services.AddCqrs();

// Build app
var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Ensure the database is created
using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<Api.Data.ApplicationDbContext>();
  dbContext.Database.EnsureCreated();
}

app.Run();
