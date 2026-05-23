using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Progress.Queries;

public class GetMyProgressHandler : IRequestHandler<GetMyProgressQuery, List<ProgressDto>>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyProgressHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<ProgressDto>> Handle(GetMyProgressQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        return await _db.LessonProgress
            .Where(p => p.UserId == userId)
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
