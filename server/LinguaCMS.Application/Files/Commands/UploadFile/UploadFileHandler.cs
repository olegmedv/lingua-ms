using LinguaCMS.Application.Files.Models;
using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Files.Commands.UploadFile;

public class UploadFileHandler : IRequestHandler<UploadFileCommand, UploadFileResponse>
{
    private readonly IFileStorage _files;

    public UploadFileHandler(IFileStorage files) => _files = files;

    public async Task<UploadFileResponse> Handle(UploadFileCommand request, CancellationToken ct)
    {
        var url = await _files.SaveAsync(request.Content, request.OriginalFileName, ct);
        return new UploadFileResponse { Url = url };
    }
}
