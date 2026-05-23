using LinguaCMS.Application.Lessons.Models;
using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public record UpdateLessonCommand(Guid Id, string Title, string? Description, int Order, int PassThreshold) : IRequest<LessonDto>;
