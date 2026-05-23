using System.Text.Json;
using LinguaCMS.Application.Extensions;
using LinguaCMS.Data;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Exercises.Commands;

public class DeleteExerciseHandler : IRequestHandler<DeleteExerciseCommand>
{
    private readonly AppDbContext _db;
    private readonly IFileStorage _files;

    public DeleteExerciseHandler(AppDbContext db, IFileStorage files)
    {
        _db = db;
        _files = files;
    }

    public async Task Handle(DeleteExerciseCommand request, CancellationToken ct)
    {
        var exercise = await _db.Exercises.FirstOrNotFoundAsync(e => e.Id == request.Id, ct);
        var urlsToDelete = new List<string>();

        if (!string.IsNullOrEmpty(exercise.AudioUrl))
            urlsToDelete.Add(exercise.AudioUrl);

        if (exercise.Type == ExerciseType.ImageSelect && !string.IsNullOrEmpty(exercise.ContentJson))
        {
            var doc = JsonDocument.Parse(exercise.ContentJson);
            var root = doc.RootElement;
            if (root.TryGetProperty("correctImageUrl", out var correct) && correct.ValueKind == JsonValueKind.String)
                urlsToDelete.Add(correct.GetString()!);
            if (root.TryGetProperty("distractorImages", out var distractors) && distractors.ValueKind == JsonValueKind.Array)
                foreach (var item in distractors.EnumerateArray())
                    if (item.ValueKind == JsonValueKind.String && !string.IsNullOrEmpty(item.GetString()))
                        urlsToDelete.Add(item.GetString()!);
        }

        exercise.IsDeleted = true;
        exercise.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        foreach (var url in urlsToDelete)
            _files.Delete(url);
    }
}
