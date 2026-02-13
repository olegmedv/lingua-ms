using LinguaCMS.Application.Lessons.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Lessons.Queries;

public record GetLessonsQuery(Guid LanguageId) : IRequest<List<LessonDto>>;

public class GetLessonsHandler : IRequestHandler<GetLessonsQuery, List<LessonDto>>
{
    private readonly AppDbContext _db;
    public GetLessonsHandler(AppDbContext db) => _db = db;

    public async Task<List<LessonDto>> Handle(GetLessonsQuery request, CancellationToken ct)
    {
        return await _db.Lessons
            .Where(l => l.LanguageId == request.LanguageId)
            .OrderBy(l => l.Order)
            .Select(l => new LessonDto { Id = l.Id, LanguageId = l.LanguageId, Title = l.Title, Description = l.Description, Order = l.Order, PassThreshold = l.PassThreshold })
            .ToListAsync(ct);
    }
}
