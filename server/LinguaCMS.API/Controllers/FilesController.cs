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

    [Authorize(Roles = "Admin")]
    [HttpPost("upload")]
    public async Task<ActionResult<UploadFileResponse>> Upload(IFormFile file)
    {
        if (file.Length == 0)
            return BadRequest("Empty file");

        await using var stream = file.OpenReadStream();
        var response = await _mediator.Send(new UploadFileCommand(stream, file.FileName));
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] string url)
    {
        await _mediator.Send(new DeleteFileCommand(url));
        return NoContent();
    }
}
