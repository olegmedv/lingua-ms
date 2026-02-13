namespace LinguaCMS.Domain.Entities;

public class Lesson
{
    public Guid Id { get; set; }
    public Guid LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int PassThreshold { get; set; } = 80;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
