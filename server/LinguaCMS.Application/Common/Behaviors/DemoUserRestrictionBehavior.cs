using LinguaCMS.Application.Auth.Commands;
using LinguaCMS.Application.Exceptions;
using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Common.Behaviors;

public class DemoUserRestrictionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    // Extend when adding new anonymous auth-flow commands (e.g. RefreshTokenCommand, LogoutCommand).
    private static readonly HashSet<Type> Exempt = new()
    {
        typeof(DemoLoginCommand),
        typeof(LoginCommand),
        typeof(RegisterCommand)
    };

    private readonly ICurrentUser _currentUser;

    public DemoUserRestrictionBehavior(ICurrentUser currentUser) => _currentUser = currentUser;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (typeof(TRequest).Name.EndsWith("Command")
            && !Exempt.Contains(typeof(TRequest))
            && _currentUser.IsInRole("Demo"))
        {
            throw new UnauthorizedException("Demo users cannot modify content");
        }

        return await next();
    }
}
