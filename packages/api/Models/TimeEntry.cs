namespace Api.Models;

public class TimeEntry
{
  public int Id { get; set; }
  public Guid ProjectId { get; set; }
  public string UserId { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public decimal Hours { get; set; }
}
