using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Lessons.Commands;

public record DeleteLessonCommand(Guid Id) : IRequest;

public class DeleteLessonHandler : IRequestHandler<DeleteLessonCommand>
{
    private readonly AppDbContext _db;
    public DeleteLessonHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteLessonCommand request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrDefaultAsync(l => l.Id == request.Id, ct)
            ?? throw new Exception("Lesson not found");

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync(ct);
    }
}
