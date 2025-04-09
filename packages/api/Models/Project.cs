namespace api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<TimeEntry> TimeEntries { get; set; } = new();
}