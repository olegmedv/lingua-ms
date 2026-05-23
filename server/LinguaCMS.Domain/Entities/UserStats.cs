using LinguaCMS.Domain.Interfaces;

namespace LinguaCMS.Domain.Entities;

public class UserStats : IAuditable
{
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public int TotalXp { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
