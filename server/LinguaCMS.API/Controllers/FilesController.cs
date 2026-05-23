using LinguaCMS.API.ModelBinders;
using LinguaCMS.Application.Files.Commands.DeleteFile;
using LinguaCMS.Application.Files.Commands.UploadFile;
using LinguaCMS.Application.Files.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IMediator _mediator;
    public FilesController(IMediator mediator) => _mediator = mediator;

    [Authorize(Roles = "Admin,Demo")]
    [HttpPost("upload")]
    public async Task<ActionResult<UploadFileResponse>> Upload([ModelBinder(typeof(UploadFileModelBinder))] UploadFileCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Roles = "Admin,Demo")]
    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] string url)
    {
        await _mediator.Send(new DeleteFileCommand(url));
        return NoContent();
    }
}
