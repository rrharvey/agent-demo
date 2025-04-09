namespace api.Models;

public class TimeEntry
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public bool IsBillable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}