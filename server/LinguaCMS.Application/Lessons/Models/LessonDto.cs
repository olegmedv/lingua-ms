namespace LinguaCMS.Application.Lessons.Models;

public class LessonDto
{
    public Guid Id { get; set; }
    public Guid LanguageId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int PassThreshold { get; set; }
}
