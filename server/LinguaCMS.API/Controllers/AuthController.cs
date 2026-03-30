using System.Security.Claims;
using LinguaCMS.Application.Auth.Commands;
using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Auth.Queries;
using LinguaCMS.API.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinguaCMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly JwtTokenService _jwt;

    public AuthController(IMediator mediator, JwtTokenService jwt)
    {
        _mediator = mediator;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterCommand(request.Email, request.DisplayName, request.Password));
        result.Token = _jwt.GenerateToken(result.User.Id, result.User.Email, result.User.Role);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password));
        result.Token = _jwt.GenerateToken(result.User.Id, result.User.Email, result.User.Role);
        return Ok(result);
    }

    [HttpPost("demo")]
    public async Task<ActionResult<AuthResponse>> DemoLogin()
    {
        var result = await _mediator.Send(new DemoLoginCommand());
        result.Token = _jwt.GenerateToken(result.User.Id, result.User.Email, result.User.Role);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetMeQuery(userId));
        return Ok(result);
    }
}
