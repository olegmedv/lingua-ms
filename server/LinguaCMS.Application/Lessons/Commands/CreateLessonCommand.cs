using LinguaCMS.Application.Lessons.Models;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public record CreateLessonCommand(Guid LanguageId, string Title, string? Description, int Order, int PassThreshold) : IRequest<LessonDto>;

public class CreateLessonHandler : IRequestHandler<CreateLessonCommand, LessonDto>
{
    private readonly AppDbContext _db;
    public CreateLessonHandler(AppDbContext db) => _db = db;

    public async Task<LessonDto> Handle(CreateLessonCommand request, CancellationToken ct)
    {
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            LanguageId = request.LanguageId,
            Title = request.Title,
            Description = request.Description,
            Order = request.Order,
            PassThreshold = request.PassThreshold,
            CreatedAt = DateTime.UtcNow
        };

        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync(ct);

        return new LessonDto { Id = lesson.Id, LanguageId = lesson.LanguageId, Title = lesson.Title, Description = lesson.Description, Order = lesson.Order, PassThreshold = lesson.PassThreshold };
    }
}
