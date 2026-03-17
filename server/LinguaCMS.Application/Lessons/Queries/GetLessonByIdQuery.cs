using LinguaCMS.Application.Extensions;
using LinguaCMS.Application.Lessons.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Lessons.Queries;

public record GetLessonByIdQuery(Guid Id) : IRequest<LessonDto>;

public class GetLessonByIdHandler : IRequestHandler<GetLessonByIdQuery, LessonDto>
{
    private readonly AppDbContext _db;
    public GetLessonByIdHandler(AppDbContext db) => _db = db;

    public async Task<LessonDto> Handle(GetLessonByIdQuery request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        return new LessonDto { Id = lesson.Id, LanguageId = lesson.LanguageId, Title = lesson.Title, Description = lesson.Description, Order = lesson.Order, PassThreshold = lesson.PassThreshold };
    }
}
