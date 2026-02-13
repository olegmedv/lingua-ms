using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Progress.Queries;

public record GetMyProgressQuery(Guid UserId) : IRequest<List<ProgressDto>>;

public class GetMyProgressHandler : IRequestHandler<GetMyProgressQuery, List<ProgressDto>>
{
    private readonly AppDbContext _db;
    public GetMyProgressHandler(AppDbContext db) => _db = db;

    public async Task<List<ProgressDto>> Handle(GetMyProgressQuery request, CancellationToken ct)
    {
        return await _db.LessonProgress
            .Where(p => p.UserId == request.UserId)
            .Include(p => p.Lesson)
            .OrderByDescending(p => p.CompletedAt)
            .Select(p => new ProgressDto
            {
                Id = p.Id,
                LessonId = p.LessonId,
                LessonTitle = p.Lesson.Title,
                Score = p.Score,
                Completed = p.Completed,
                XpEarned = p.XpEarned,
                CompletedAt = p.CompletedAt
            })
            .ToListAsync(ct);
    }
}
