using LinguaCMS.Domain.Enums;

namespace LinguaCMS.Domain.Entities;

public class Exercise
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public ExerciseType Type { get; set; }
    public string ContentJson { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Order { get; set; }
}
