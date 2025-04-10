namespace Api.Models;

public class Project
{
  public Guid Id { get; set; }
  public string Name { get; set; } = string.Empty;
  public Guid ClientId { get; set; }
}
