using LinguaCMS.Application.Lessons.Commands;
using LinguaCMS.Application.Lessons.Models;
using LinguaCMS.Application.Lessons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api")]
public class LessonsController : ControllerBase
{
    private readonly IMediator _mediator;
    public LessonsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("languages/{langId}/lessons")]
    public async Task<ActionResult<List<LessonDto>>> GetByLanguage(Guid langId)
        => Ok(await _mediator.Send(new GetLessonsQuery(langId)));

    [HttpGet("lessons/{id}")]
    public async Task<ActionResult<LessonDto>> GetById(Guid id)
        => Ok(await _mediator.Send(new GetLessonByIdQuery(id)));

    [Authorize(Roles = "Admin")]
    [HttpPost("languages/{langId}/lessons")]
    public async Task<ActionResult<LessonDto>> Create(Guid langId, CreateLessonRequest request)
        => Ok(await _mediator.Send(new CreateLessonCommand(langId, request.Title, request.Description, request.Order, request.PassThreshold)));

    [Authorize(Roles = "Admin")]
    [HttpPut("lessons/{id}")]
    public async Task<ActionResult<LessonDto>> Update(Guid id, UpdateLessonRequest request)
        => Ok(await _mediator.Send(new UpdateLessonCommand(id, request.Title, request.Description, request.Order, request.PassThreshold)));

    [Authorize(Roles = "Admin")]
    [HttpDelete("lessons/{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteLessonCommand(id));
        return NoContent();
    }
}
