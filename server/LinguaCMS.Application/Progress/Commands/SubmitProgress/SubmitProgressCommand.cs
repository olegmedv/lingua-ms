using LinguaCMS.Application.Progress.Models;
using MediatR;

namespace LinguaCMS.Application.Progress.Commands;

public record SubmitProgressCommand(Guid LessonId, int Score) : IRequest<ProgressDto>;
