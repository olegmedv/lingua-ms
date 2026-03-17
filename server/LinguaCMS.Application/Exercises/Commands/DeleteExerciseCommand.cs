using LinguaCMS.Application.Extensions;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record DeleteExerciseCommand(Guid Id) : IRequest;

public class DeleteExerciseHandler : IRequestHandler<DeleteExerciseCommand>
{
    private readonly AppDbContext _db;
    public DeleteExerciseHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrNotFoundAsync(e => e.Id == request.Id, ct);

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync(ct);
    }
}
