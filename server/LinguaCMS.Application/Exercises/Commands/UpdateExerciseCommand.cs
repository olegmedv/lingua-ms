using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Domain.Enums;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record UpdateExerciseCommand(Guid Id, ExerciseType Type, string ContentJson, string? AudioUrl, int Order) : IRequest<ExerciseDto>;
