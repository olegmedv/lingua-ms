using LinguaCMS.Application.Languages.Models;
using MediatR;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguagesQuery(bool IsAdmin = false) : IRequest<List<LanguageDto>>;
