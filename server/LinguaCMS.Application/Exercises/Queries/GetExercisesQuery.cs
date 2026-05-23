using LinguaCMS.Application.Exercises.Models;
using MediatR;

namespace LinguaCMS.Application.Exercises.Queries;

public record GetExercisesQuery(Guid LessonId) : IRequest<List<ExerciseDto>>;
