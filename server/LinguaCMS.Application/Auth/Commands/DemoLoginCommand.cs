using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Common;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Commands;

public record DemoLoginCommand : IRequest<AuthResponse>;

public class DemoLoginHandler : IRequestHandler<DemoLoginCommand, AuthResponse>
{
    private readonly AppDbContext _db;

    private const string DemoEmail = "demo@linguacms.com";
    private const string DemoName = "Demo Admin";

    public DemoLoginHandler(AppDbContext db) => _db = db;

    public async Task<AuthResponse> Handle(DemoLoginCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == DemoEmail, ct);

        if (user == null)
        {
            user = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = DemoEmail,
                DisplayName = DemoName,
                PasswordHash = PasswordHasher.Hash(Guid.NewGuid().ToString()),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }

        // Seed fake progress if none exists
        var hasProgress = await _db.LessonProgress.AnyAsync(p => p.UserId == user.Id, ct);
        if (!hasProgress)
        {
            await SeedDemoProgress(user.Id, ct);
        }

        return new AuthResponse
        {
            Token = "",
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role.ToString()
            }
        };
    }

    private async Task SeedDemoProgress(Guid userId, CancellationToken ct)
    {
        var demoLang = await _db.Languages.FirstOrDefaultAsync(l => l.IsDemo && l.IsPublished, ct);
        if (demoLang == null) return;

        var lessons = await _db.Lessons
            .Where(l => l.LanguageId == demoLang.Id)
            .OrderBy(l => l.Order)
            .ToListAsync(ct);

        if (lessons.Count == 0) return;

        int[] scores = { 100, 90, 95, 85, 90 };
        var totalXp = 0;

        for (var i = 0; i < lessons.Count; i++)
        {
            var score = scores[i % scores.Length];
            var xp = 10 + score / 10;
            totalXp += xp;

            _db.LessonProgress.Add(new LessonProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LessonId = lessons[i].Id,
                Score = score,
                Completed = true,
                XpEarned = xp,
                CompletedAt = DateTime.UtcNow.AddDays(-lessons.Count + i)
            });
        }

        _db.UserStats.Add(new UserStats
        {
            UserId = userId,
            TotalXp = totalXp,
            CurrentStreak = lessons.Count,
            LongestStreak = lessons.Count,
            LastActivityDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
    }
}
