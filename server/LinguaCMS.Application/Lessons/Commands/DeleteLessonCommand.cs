using LinguaCMS.Application.Extensions;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Lessons.Commands;

public record DeleteLessonCommand(Guid Id) : IRequest;

public class DeleteLessonHandler : IRequestHandler<DeleteLessonCommand>
{
    private readonly AppDbContext _db;
    public DeleteLessonHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteLessonCommand request, CancellationToken ct)
    {
        var lesson = await _db.Lessons.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync(ct);
    }
}
