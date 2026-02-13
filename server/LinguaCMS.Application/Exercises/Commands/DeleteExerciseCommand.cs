using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Exercises.Commands;

public record DeleteExerciseCommand(Guid Id) : IRequest;

public class DeleteExerciseHandler : IRequestHandler<DeleteExerciseCommand>
{
    private readonly AppDbContext _db;
    public DeleteExerciseHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrDefaultAsync(e => e.Id == request.Id, ct)
            ?? throw new Exception("Exercise not found");

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync(ct);
    }
}
