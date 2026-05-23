using LinguaCMS.Application.Lessons.Models;
using MediatR;

namespace LinguaCMS.Application.Lessons.Queries;

public record GetLessonByIdQuery(Guid Id) : IRequest<LessonDto>;
