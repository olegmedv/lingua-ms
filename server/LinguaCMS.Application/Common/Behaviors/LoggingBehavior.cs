using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace LinguaCMS.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger) => _logger = logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();
        _logger.LogInformation("MediatR {RequestName} handled in {ElapsedMs}ms", typeof(TRequest).Name, sw.ElapsedMilliseconds);
        return response;
    }
}
