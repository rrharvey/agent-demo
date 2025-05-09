namespace Api.Models;

public class Client
{
  public Guid Id { get; set; }
  public string Name { get; set; } = string.Empty;
  public List<Project> Projects { get; set; } = [];
}
