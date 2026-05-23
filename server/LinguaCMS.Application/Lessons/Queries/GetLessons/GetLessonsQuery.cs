using LinguaCMS.Application.Lessons.Models;
using MediatR;

namespace LinguaCMS.Application.Lessons.Queries;

public record GetLessonsQuery(Guid LanguageId) : IRequest<List<LessonDto>>;
