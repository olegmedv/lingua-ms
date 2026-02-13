using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Exercises.Commands;

public record UpdateExerciseCommand(Guid Id, ExerciseType Type, string ContentJson, string? AudioUrl, int Order) : IRequest<ExerciseDto>;

public class UpdateExerciseHandler : IRequestHandler<UpdateExerciseCommand, ExerciseDto>
{
    private readonly AppDbContext _db;
    public UpdateExerciseHandler(AppDbContext db) => _db = db;

    public async Task<ExerciseDto> Handle(UpdateExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrDefaultAsync(e => e.Id == request.Id, ct)
            ?? throw new Exception("Exercise not found");

        exercise.Type = request.Type;
        exercise.ContentJson = request.ContentJson;
        exercise.AudioUrl = request.AudioUrl;
        exercise.Order = request.Order;

        await _db.SaveChangesAsync(ct);

        return new ExerciseDto { Id = exercise.Id, LessonId = exercise.LessonId, Type = exercise.Type, ContentJson = exercise.ContentJson, AudioUrl = exercise.AudioUrl, Order = exercise.Order };
    }
}
