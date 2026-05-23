using MediatR;

namespace LinguaCMS.Application.Files.Commands.DeleteFile;

public record DeleteFileCommand(string Url) : IRequest;
