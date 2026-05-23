using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Progress.Queries;

public class GetStatsHandler : IRequestHandler<GetStatsQuery, StatsDto>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetStatsHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<StatsDto> Handle(GetStatsQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var stats = await _db.UserStats.FirstOrDefaultAsync(s => s.UserId == userId, ct);
        var completedLessons = await _db.LessonProgress.CountAsync(p => p.UserId == userId && p.Completed, ct);

        // Average score across best attempt per lesson
        var bestScores = await _db.LessonProgress
            .Where(p => p.UserId == userId && p.Completed)
            .GroupBy(p => p.LessonId)
            .Select(g => g.Max(p => p.Score))
            .ToListAsync(ct);
        var avgScore = bestScores.Count > 0 ? bestScores.Average() : 0;

        return new StatsDto
        {
            TotalXp = stats?.TotalXp ?? 0,
            CurrentStreak = stats?.CurrentStreak ?? 0,
            LongestStreak = stats?.LongestStreak ?? 0,
            LastActivityDate = stats?.LastActivityDate ?? DateTime.MinValue,
            CompletedLessons = completedLessons,
            AverageScore = (int)Math.Round(avgScore)
        };
    }
}
