using LinguaCMS.Application.Languages.Models;
using MediatR;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguageByIdQuery(Guid Id) : IRequest<LanguageDto>;
