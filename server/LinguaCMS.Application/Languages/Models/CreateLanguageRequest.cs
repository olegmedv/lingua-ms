namespace LinguaCMS.Application.Languages.Models;

public class CreateLanguageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public bool IsDemo { get; set; }
}
