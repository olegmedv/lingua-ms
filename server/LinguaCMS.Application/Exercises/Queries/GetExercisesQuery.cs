using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Exercises.Queries;

public record GetExercisesQuery(Guid LessonId) : IRequest<List<ExerciseDto>>;

public class GetExercisesHandler : IRequestHandler<GetExercisesQuery, List<ExerciseDto>>
{
    private readonly AppDbContext _db;
    public GetExercisesHandler(AppDbContext db) => _db = db;

    public async Task<List<ExerciseDto>> Handle(GetExercisesQuery request, CancellationToken ct)
    {
        return await _db.Exercises
            .Where(e => e.LessonId == request.LessonId)
            .OrderBy(e => e.Order)
            .Select(e => new ExerciseDto { Id = e.Id, LessonId = e.LessonId, Type = e.Type, ContentJson = e.ContentJson, AudioUrl = e.AudioUrl, Order = e.Order })
            .ToListAsync(ct);
    }
}
