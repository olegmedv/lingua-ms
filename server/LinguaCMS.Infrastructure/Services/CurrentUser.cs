using System.Security.Claims;
using LinguaCMS.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace LinguaCMS.Infrastructure.Services;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    private ClaimsPrincipal? User => _accessor.HttpContext?.User;

    public Guid UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : Guid.Empty;
        }
    }

    public string Role => User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public bool IsAdmin => User?.IsInRole("Admin") ?? false;

    public bool IsDemo => User?.IsInRole("Demo") ?? false;

    public bool HasAdminAccess => IsAdmin || IsDemo;
}
