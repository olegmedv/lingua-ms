using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Progress.Commands;

public record SubmitProgressCommand(Guid UserId, Guid LessonId, int Score) : IRequest<ProgressDto>;

public class SubmitProgressHandler : IRequestHandler<SubmitProgressCommand, ProgressDto>
{
    private readonly AppDbContext _db;
    public SubmitProgressHandler(AppDbContext db) => _db = db;

    public async Task<ProgressDto> Handle(SubmitProgressCommand request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == request.LessonId, ct)
            ?? throw new Exception("Lesson not found");

        var completed = request.Score >= lesson.PassThreshold;
        var xp = completed ? 10 + (request.Score / 10) : 0;

        var progress = new LessonProgress
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            LessonId = request.LessonId,
            Score = request.Score,
            Completed = completed,
            XpEarned = xp,
            CompletedAt = DateTime.UtcNow
        };

        _db.LessonProgress.Add(progress);

        // Update user stats
        var stats = await _db.UserStats.FirstOrDefaultAsync(s => s.UserId == request.UserId, ct);
        if (stats == null)
        {
            stats = new UserStats { UserId = request.UserId, LastActivityDate = DateTime.UtcNow };
            _db.UserStats.Add(stats);
        }

        stats.TotalXp += xp;
        var today = DateTime.UtcNow.Date;
        if (stats.LastActivityDate.Date == today.AddDays(-1))
        {
            stats.CurrentStreak++;
        }
        else if (stats.LastActivityDate.Date != today)
        {
            stats.CurrentStreak = 1;
        }
        if (stats.CurrentStreak > stats.LongestStreak)
            stats.LongestStreak = stats.CurrentStreak;
        stats.LastActivityDate = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new ProgressDto
        {
            Id = progress.Id,
            LessonId = progress.LessonId,
            LessonTitle = lesson.Title,
            Score = progress.Score,
            Completed = progress.Completed,
            XpEarned = progress.XpEarned,
            CompletedAt = progress.CompletedAt
        };
    }
}
