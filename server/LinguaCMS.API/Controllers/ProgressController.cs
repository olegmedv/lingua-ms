using LinguaCMS.Application.Progress.Commands;
using LinguaCMS.Application.Progress.Models;
using LinguaCMS.Application.Progress.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProgressController(IMediator mediator) => _mediator = mediator;

    [HttpPost("submit")]
    public async Task<ActionResult<ProgressDto>> Submit([FromBody] SubmitProgressRequest request)
        => Ok(await _mediator.Send(new SubmitProgressCommand(request.LessonId, request.Score)));

    [HttpGet("my")]
    public async Task<ActionResult<List<ProgressDto>>> GetMy()
        => Ok(await _mediator.Send(new GetMyProgressQuery()));

    [HttpGet("stats")]
    public async Task<ActionResult<StatsDto>> GetStats()
        => Ok(await _mediator.Send(new GetStatsQuery()));
}
