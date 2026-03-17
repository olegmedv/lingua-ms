using LinguaCMS.Application.Extensions;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record DeleteExerciseCommand(Guid Id) : IRequest<string?>;

public class DeleteExerciseHandler : IRequestHandler<DeleteExerciseCommand, string?>
{
    private readonly AppDbContext _db;
    public DeleteExerciseHandler(AppDbContext db) => _db = db;

    public async Task<string?> Handle(DeleteExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrNotFoundAsync(e => e.Id == request.Id, ct);
        var audioUrl = exercise.AudioUrl;

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync(ct);

        return audioUrl;
    }
}
