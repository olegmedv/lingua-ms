using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Common;
using LinguaCMS.Application.Exceptions;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Commands;

public record RegisterCommand(string Email, string DisplayName, string Password) : IRequest<AuthResponse>;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly AppDbContext _db;

    public RegisterHandler(AppDbContext db) => _db = db;

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new ConflictException("Email already registered");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return new AuthResponse
        {
            Token = "",
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
