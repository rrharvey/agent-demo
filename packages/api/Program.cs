using Api;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();

// Configure EF Core with SQLite
builder.Services.AddDbContext<Api.Data.ApplicationDbContext>(options =>
  options
    .UseSqlite(
      builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=../../data/timetracker.db"
    )
    .UseSeeding(DemoData.SeedData)
);

// Add OpenAPI documentation
builder.Services.AddOpenApi();

// Register CQRS handlers
builder.Services.AddCqrs();

// Build app
var app = builder.Build();

// Ensure the database is created
using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<Api.Data.ApplicationDbContext>();
  dbContext.Database.EnsureCreated();
}

// Allow CORS for this demo API
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Enable OpenAPI documentation in development
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.MapScalarApiReference();
}

app.MapEndpoints();

app.Run();
