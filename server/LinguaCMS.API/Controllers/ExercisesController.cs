using LinguaCMS.Application.Exercises.Commands;
using LinguaCMS.Application.Exercises.Models;
using LinguaCMS.Application.Exercises.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api")]
public class ExercisesController : ControllerBase
{
    private readonly IMediator _mediator;
    public ExercisesController(IMediator mediator) => _mediator = mediator;

    [HttpGet("lessons/{lessonId}/exercises")]
    public async Task<ActionResult<List<ExerciseDto>>> GetByLesson(Guid lessonId)
        => Ok(await _mediator.Send(new GetExercisesQuery(lessonId)));

    [Authorize(Roles = "Admin")]
    [HttpPost("lessons/{lessonId}/exercises")]
    public async Task<ActionResult<ExerciseDto>> Create(Guid lessonId, CreateExerciseRequest request)
        => Ok(await _mediator.Send(new CreateExerciseCommand(lessonId, request.Type, request.ContentJson, request.AudioUrl, request.Order)));

    [Authorize(Roles = "Admin")]
    [HttpPut("exercises/{id}")]
    public async Task<ActionResult<ExerciseDto>> Update(Guid id, UpdateExerciseRequest request)
        => Ok(await _mediator.Send(new UpdateExerciseCommand(id, request.Type, request.ContentJson, request.AudioUrl, request.Order)));

    [Authorize(Roles = "Admin")]
    [HttpDelete("exercises/{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteExerciseCommand(id));
        return NoContent();
    }
}
