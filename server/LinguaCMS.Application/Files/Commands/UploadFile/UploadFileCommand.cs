using LinguaCMS.Application.Files.Models;
using MediatR;

namespace LinguaCMS.Application.Files.Commands.UploadFile;

public record UploadFileCommand(Stream Content, string OriginalFileName, long Length) : IRequest<UploadFileResponse>;
