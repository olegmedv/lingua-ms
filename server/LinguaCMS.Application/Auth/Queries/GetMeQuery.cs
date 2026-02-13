using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Auth.Queries;

public record GetMeQuery(Guid UserId) : IRequest<UserDto>;

public class GetMeHandler : IRequestHandler<GetMeQuery, UserDto>
{
    private readonly AppDbContext _db;

    public GetMeHandler(AppDbContext db) => _db = db;

    public async Task<UserDto> Handle(GetMeQuery request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, ct)
            ?? throw new Exception("User not found");

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }
}
