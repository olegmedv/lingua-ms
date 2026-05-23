using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Exceptions;
using LinguaCMS.Data;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Domain.Enums;
using LinguaCMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Commands;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IPasswordHasher _hasher;

    public RegisterHandler(AppDbContext db, IJwtTokenService jwt, IPasswordHasher hasher)
    {
        _db = db;
        _jwt = jwt;
        _hasher = hasher;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new ConflictException("Email already registered");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = _hasher.Hash(request.Password),
            Role = UserRole.Student
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

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
