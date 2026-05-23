using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Domain.Enums;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record CreateExerciseCommand(Guid LessonId, ExerciseType Type, string ContentJson, string? AudioUrl, int Order) : IRequest<ExerciseDto>;
