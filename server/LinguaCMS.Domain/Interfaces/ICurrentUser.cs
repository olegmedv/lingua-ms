namespace LinguaCMS.Domain.Interfaces;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Role { get; }
    bool IsAdmin { get; }
    bool IsInRole(string role);
}
