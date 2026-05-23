using LinguaCMS.Application.Extensions;
using LinguaCMS.Data;
using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public class DeleteLessonHandler : IRequestHandler<DeleteLessonCommand>
{
    private readonly AppDbContext _db;
    public DeleteLessonHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteLessonCommand request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        lesson.IsDeleted = true;
        lesson.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
