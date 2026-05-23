using LinguaCMS.Application.Progress.Models;
using MediatR;

namespace LinguaCMS.Application.Progress.Queries;

public record GetMyProgressQuery(Guid UserId) : IRequest<List<ProgressDto>>;
