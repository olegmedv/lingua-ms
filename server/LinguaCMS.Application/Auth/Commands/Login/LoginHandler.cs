using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Exceptions;
using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Commands;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IPasswordHasher _hasher;

    public LoginHandler(AppDbContext db, IJwtTokenService jwt, IPasswordHasher hasher)
    {
        _db = db;
        _jwt = jwt;
        _hasher = hasher;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct)
            ?? throw new UnauthorizedException("Invalid credentials");

        if (!_hasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials");

        return new AuthResponse
        {
            Token = _jwt.GenerateToken(user.Id, user.Email, user.Role.ToString()),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role.ToString()
            }
        };
    }
}
