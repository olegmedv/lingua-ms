using LinguaCMS.Application.Languages.Models;
using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public record CreateLanguageCommand(string Name, string Description, string? ImageUrl, bool IsPublished, bool IsDemo) : IRequest<LanguageDto>;
