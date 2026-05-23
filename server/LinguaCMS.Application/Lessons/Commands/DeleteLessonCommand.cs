using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public record DeleteLessonCommand(Guid Id) : IRequest;
