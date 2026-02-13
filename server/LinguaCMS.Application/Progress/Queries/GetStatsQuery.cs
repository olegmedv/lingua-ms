using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Progress.Queries;

public record GetStatsQuery(Guid UserId) : IRequest<StatsDto>;

public class GetStatsHandler : IRequestHandler<GetStatsQuery, StatsDto>
{
    private readonly AppDbContext _db;
    public GetStatsHandler(AppDbContext db) => _db = db;

    public async Task<StatsDto> Handle(GetStatsQuery request, CancellationToken ct)
    {
        var stats = await _db.UserStats.FirstOrDefaultAsync(s => s.UserId == request.UserId, ct);
        var completedLessons = await _db.LessonProgress.CountAsync(p => p.UserId == request.UserId && p.Completed, ct);

        return new StatsDto
        {
            TotalXp = stats?.TotalXp ?? 0,
            CurrentStreak = stats?.CurrentStreak ?? 0,
            LongestStreak = stats?.LongestStreak ?? 0,
            LastActivityDate = stats?.LastActivityDate ?? DateTime.MinValue,
            CompletedLessons = completedLessons
        };
    }
}
