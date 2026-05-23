using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record DeleteExerciseCommand(Guid Id) : IRequest;
