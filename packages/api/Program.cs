var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();

// Build app
var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.Run();
