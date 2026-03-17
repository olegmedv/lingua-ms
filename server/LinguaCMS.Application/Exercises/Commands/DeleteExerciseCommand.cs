using System.Text.Json;
using LinguaCMS.Application.Extensions;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public record DeleteExerciseCommand(Guid Id) : IRequest<DeleteExerciseResult>;

public record DeleteExerciseResult(string? AudioUrl, List<string> ImageUrls);

public class DeleteExerciseHandler : IRequestHandler<DeleteExerciseCommand, DeleteExerciseResult>
{
    private readonly AppDbContext _db;
    public DeleteExerciseHandler(AppDbContext db) => _db = db;

    public async Task<DeleteExerciseResult> Handle(DeleteExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrNotFoundAsync(e => e.Id == request.Id, ct);
        var audioUrl = exercise.AudioUrl;
        var imageUrls = new List<string>();

        if (exercise.Type == ExerciseType.ImageSelect && !string.IsNullOrEmpty(exercise.ContentJson))
        {
            try
            {
                var doc = JsonDocument.Parse(exercise.ContentJson);
                var root = doc.RootElement;
                if (root.TryGetProperty("correctImageUrl", out var correct) && correct.ValueKind == JsonValueKind.String)
                    imageUrls.Add(correct.GetString()!);
                if (root.TryGetProperty("distractorImages", out var distractors) && distractors.ValueKind == JsonValueKind.Array)
                    foreach (var item in distractors.EnumerateArray())
                        if (item.ValueKind == JsonValueKind.String && !string.IsNullOrEmpty(item.GetString()))
                            imageUrls.Add(item.GetString()!);
            }
            catch { /* ignore parse errors */ }
        }

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync(ct);

        return new DeleteExerciseResult(audioUrl, imageUrls);
    }
}
