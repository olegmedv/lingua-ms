using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;

namespace LinguaCMS.Application.Common.Behaviors;

/// <summary>
/// Wraps a Demo user's *Command request in a DB transaction that always rolls back, so
/// mutations appear to succeed in-session but never persist. Bypasses non-demo callers,
/// queries, the auth commands (Register/Login/DemoLogin), and any request invoked while
/// a transaction is already open. Known limitation: UploadFileCommand writes to disk via
/// IFileStorage outside the DB transaction — those files persist after rollback. Orphaned
/// uploads are acceptable for a demo seat and out of scope for this behavior.
/// </summary>
public class DemoTransactionRollbackBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private static readonly HashSet<string> ExemptCommands = new()
    {
        "RegisterCommand",
        "LoginCommand",
        "DemoLoginCommand"
    };

    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public DemoTransactionRollbackBehavior(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        if (!_currentUser.IsDemo ||
            !requestName.EndsWith("Command", StringComparison.Ordinal) ||
            ExemptCommands.Contains(requestName) ||
            _db.Database.CurrentTransaction != null)
        {
            return await next();
        }

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        var response = await next();
        await tx.RollbackAsync(cancellationToken);
        return response;
    }
}
