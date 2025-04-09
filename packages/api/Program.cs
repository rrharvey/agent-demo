using api.Data;
using api.Endpoints;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore; // Add Scalar namespace

var builder = WebApplication.CreateBuilder(args);

// Add SQLite database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=timetracker.db"));

// Add services to the container.
builder.Services.AddOpenApi(); // .NET 9's built-in OpenAPI support
builder.Services.AddCors();

// Build app
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Use .NET 9's built-in OpenAPI endpoint
    app.MapScalarApiReference(); // Add Scalar API Reference UI
    
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// Register all endpoints using the new convention
app.RegisterAllEndpoints();

app.Run();
