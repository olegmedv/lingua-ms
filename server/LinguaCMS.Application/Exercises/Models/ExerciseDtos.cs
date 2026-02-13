using LinguaCMS.Domain.Enums;

namespace LinguaCMS.Application.Exercises.Models;

public class ExerciseDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public ExerciseType Type { get; set; }
    public string ContentJson { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Order { get; set; }
}

public class CreateExerciseRequest
{
    public ExerciseType Type { get; set; }
    public string ContentJson { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Order { get; set; }
}

public class UpdateExerciseRequest
{
    public ExerciseType Type { get; set; }
    public string ContentJson { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Order { get; set; }
}
