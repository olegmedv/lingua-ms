using LinguaCMS.Application.Languages.Models;
using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public record UpdateLanguageCommand(Guid Id, string Name, string Description, string? ImageUrl, bool IsPublished, bool IsDemo) : IRequest<LanguageDto>;
