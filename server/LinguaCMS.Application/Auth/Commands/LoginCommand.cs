using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly AppDbContext _db;

    public LoginHandler(AppDbContext db) => _db = db;

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct)
            ?? throw new Exception("Invalid credentials");

        if (user.PasswordHash != RegisterHandler.HashPassword(request.Password))
            throw new Exception("Invalid credentials");

        return new AuthResponse
        {
            Token = "", // Token will be set by controller
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
