using LinguaCMS.Application.Auth.Commands;
using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        => Ok(await _mediator.Send(new RegisterCommand(request.Email, request.DisplayName, request.Password)));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        => Ok(await _mediator.Send(new LoginCommand(request.Email, request.Password)));

    [HttpPost("demo")]
    public async Task<ActionResult<AuthResponse>> DemoLogin()
        => Ok(await _mediator.Send(new DemoLoginCommand()));

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
        => Ok(await _mediator.Send(new GetMeQuery()));
}
