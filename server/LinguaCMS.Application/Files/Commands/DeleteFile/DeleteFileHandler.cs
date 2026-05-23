using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Files.Commands.DeleteFile;

public class DeleteFileHandler : IRequestHandler<DeleteFileCommand>
{
    private readonly IFileStorage _files;

    public DeleteFileHandler(IFileStorage files) => _files = files;

    public Task Handle(DeleteFileCommand request, CancellationToken ct)
    {
        _files.Delete(request.Url);
        return Task.CompletedTask;
    }
}
