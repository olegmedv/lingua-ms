namespace LinguaCMS.Application.Lessons.Models;

public class CreateLessonRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int PassThreshold { get; set; } = 80;
}
