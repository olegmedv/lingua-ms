namespace LinguaCMS.Domain.Entities;

public class UserStats
{
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public int TotalXp { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
}
