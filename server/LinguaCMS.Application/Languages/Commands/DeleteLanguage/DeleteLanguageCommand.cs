using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public record DeleteLanguageCommand(Guid Id) : IRequest;
