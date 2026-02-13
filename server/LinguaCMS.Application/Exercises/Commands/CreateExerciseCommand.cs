using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record CreateExerciseCommand(Guid LessonId, ExerciseType Type, string ContentJson, string? AudioUrl, int Order) : IRequest<ExerciseDto>;

public class CreateExerciseHandler : IRequestHandler<CreateExerciseCommand, ExerciseDto>
{
    private readonly AppDbContext _db;
    public CreateExerciseHandler(AppDbContext db) => _db = db;

    public async Task<ExerciseDto> Handle(CreateExerciseCommand request, CancellationToken ct)
    {
        var exercise = new Exercise
        {
            Id = Guid.NewGuid(),
            LessonId = request.LessonId,
            Type = request.Type,
            ContentJson = request.ContentJson,
            AudioUrl = request.AudioUrl,
            Order = request.Order
        };

        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync(ct);

        return new ExerciseDto { Id = exercise.Id, LessonId = exercise.LessonId, Type = exercise.Type, ContentJson = exercise.ContentJson, AudioUrl = exercise.AudioUrl, Order = exercise.Order };
    }
}
