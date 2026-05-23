using LinguaCMS.Application.Languages.Models;
using MediatR;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguagesQuery : IRequest<List<LanguageDto>>;
