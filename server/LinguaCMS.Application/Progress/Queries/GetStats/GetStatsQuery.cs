using LinguaCMS.Application.Progress.Models;
using MediatR;

namespace LinguaCMS.Application.Progress.Queries;

public record GetStatsQuery : IRequest<StatsDto>;
