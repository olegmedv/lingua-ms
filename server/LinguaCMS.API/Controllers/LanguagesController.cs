using LinguaCMS.Application.Languages.Commands;
using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Application.Languages.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api/languages")]
public class LanguagesController : ControllerBase
{
    private readonly IMediator _mediator;
    public LanguagesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<LanguageDto>>> GetAll()
        => Ok(await _mediator.Send(new GetLanguagesQuery()));

    [HttpGet("demo")]
    public async Task<ActionResult<LanguageDto>> GetDemo()
        => Ok(await _mediator.Send(new GetDemoLanguageQuery()));

    [HttpGet("{id}")]
    public async Task<ActionResult<LanguageDto>> GetById(Guid id)
        => Ok(await _mediator.Send(new GetLanguageByIdQuery(id)));

    [Authorize(Roles = "Admin,Demo")]
    [HttpPost]
    public async Task<ActionResult<LanguageDto>> Create([FromBody] CreateLanguageRequest request)
        => Ok(await _mediator.Send(new CreateLanguageCommand(request.Name, request.Description, request.ImageUrl, request.IsPublished, request.IsDemo)));

    [Authorize(Roles = "Admin,Demo")]
    [HttpPut("{id}")]
    public async Task<ActionResult<LanguageDto>> Update(Guid id, [FromBody] UpdateLanguageRequest request)
        => Ok(await _mediator.Send(new UpdateLanguageCommand(id, request.Name, request.Description, request.ImageUrl, request.IsPublished, request.IsDemo)));

    [Authorize(Roles = "Admin,Demo")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteLanguageCommand(id));
        return NoContent();
    }
}
