using LinguaCMS.Application.Progress.Models;
using MediatR;

namespace LinguaCMS.Application.Progress.Queries;

public record GetMyProgressQuery : IRequest<List<ProgressDto>>;
