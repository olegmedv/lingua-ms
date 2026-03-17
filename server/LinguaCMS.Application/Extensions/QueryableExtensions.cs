using System.Linq.Expressions;
using LinguaCMS.Application.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Extensions;

public static class QueryableExtensions
{
    public static async Task<T> FirstOrNotFoundAsync<T>(
        this IQueryable<T> query,
        Expression<Func<T, bool>> predicate,
        CancellationToken ct = default) where T : class
    {
        return await query.FirstOrDefaultAsync(predicate, ct)
            ?? throw new NotFoundException($"{typeof(T).Name} not found");
    }
}
