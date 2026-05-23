using LinguaCMS.Application.Lessons.Models;
using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public record CreateLessonCommand(Guid LanguageId, string Title, string? Description, int Order, int PassThreshold) : IRequest<LessonDto>;
