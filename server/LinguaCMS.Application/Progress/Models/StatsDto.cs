namespace LinguaCMS.Application.Progress.Models;

public class StatsDto
{
    public int TotalXp { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
    public int CompletedLessons { get; set; }
    public int AverageScore { get; set; }
}
