namespace LinguaCMS.Application.Progress.Models;

public class ProgressDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public int Score { get; set; }
    public bool Completed { get; set; }
    public int XpEarned { get; set; }
    public DateTime CompletedAt { get; set; }
}
