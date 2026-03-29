namespace LinguaCMS.Application.Progress.Models;

public class SubmitProgressRequest
{
    public Guid LessonId { get; set; }
    public int Score { get; set; }
}

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

public class StatsDto
{
    public int TotalXp { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
    public int CompletedLessons { get; set; }
    public int AverageScore { get; set; }
}
