using System.Net;
using System.Text.Json;
using LinguaCMS.Application.Exceptions;

namespace LinguaCMS.API.Middleware;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlerMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var statusCode = ex switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,
                ConflictException => (int)HttpStatusCode.Conflict,
                UnauthorizedException => (int)HttpStatusCode.Unauthorized,
                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new { message = ex.Message });
            await context.Response.WriteAsync(response);
        }
    }
}
