using LinguaCMS.Domain.Enums;
using LinguaCMS.Domain.Interfaces;

namespace LinguaCMS.Domain.Entities;

public class Exercise : IAuditable
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public ExerciseType Type { get; set; }
    public string ContentJson { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
