using LinguaCMS.Application.Lessons.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Lessons.Commands;

public record UpdateLessonCommand(Guid Id, string Title, string? Description, int Order, int PassThreshold) : IRequest<LessonDto>;

public class UpdateLessonHandler : IRequestHandler<UpdateLessonCommand, LessonDto>
{
    private readonly AppDbContext _db;
    public UpdateLessonHandler(AppDbContext db) => _db = db;

    public async Task<LessonDto> Handle(UpdateLessonCommand request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == request.Id, ct)
            ?? throw new Exception("Lesson not found");

        lesson.Title = request.Title;
        lesson.Description = request.Description;
        lesson.Order = request.Order;
        lesson.PassThreshold = request.PassThreshold;

        await _db.SaveChangesAsync(ct);

        return new LessonDto { Id = lesson.Id, LanguageId = lesson.LanguageId, Title = lesson.Title, Description = lesson.Description, Order = lesson.Order, PassThreshold = lesson.PassThreshold };
    }
}
