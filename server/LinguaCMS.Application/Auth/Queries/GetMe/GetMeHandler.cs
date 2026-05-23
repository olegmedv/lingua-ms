using LinguaCMS.Application.Auth.Models;
using LinguaCMS.Application.Extensions;
using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Auth.Queries;

public class GetMeHandler : IRequestHandler<GetMeQuery, UserDto>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMeHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserDto> Handle(GetMeQuery request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrNotFoundAsync(u => u.Id == _currentUser.UserId, ct);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }
}
