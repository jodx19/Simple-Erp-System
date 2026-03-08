using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text.Json;

namespace SimpleERP.Middleware
{
    public class ConcurrencyExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ConcurrencyExceptionMiddleware> _logger;

        public ConcurrencyExceptionMiddleware(RequestDelegate next, ILogger<ConcurrencyExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Concurrency conflict");
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                context.Response.ContentType = "application/json";
                var payload = JsonSerializer.Serialize(new { message = "Concurrency conflict. Please retry the operation." });
                await context.Response.WriteAsync(payload);
            }
        }
    }
}
