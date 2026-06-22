using System.Net;
using System.Text.Json;
using FluentValidation;
using log4net;

namespace CozyHavenStayV3.IdentityService.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next; 

        
        private static readonly ILog Log = LogManager.GetLogger(typeof(GlobalExceptionMiddleware)); 

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message, errors) = MapException(exception);

            Log.Error($"Unhandled exception on {context.Request.Method} {context.Request.Path}", exception);

            context.Response.StatusCode = (int)statusCode;

            var payload = new
            {
                status = (int)statusCode,
                message,
                errors,
                traceId = context.TraceIdentifier
            };

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            return context.Response.WriteAsync(json);
        }

        private static (HttpStatusCode statusCode, string message, IEnumerable<string>? errors) MapException(Exception exception)
        {
            switch (exception)
            {
                case ValidationException validationEx:
                    return (
                        HttpStatusCode.BadRequest,
                        "One or more validation errors occurred.",
                        validationEx.Errors.Select(e => e.ErrorMessage)
                    );

                case UnauthorizedAccessException unauthorizedEx:
                    return (
                        HttpStatusCode.Unauthorized,
                        unauthorizedEx.Message,
                        null
                    );

                case KeyNotFoundException:
                    return (
                        HttpStatusCode.NotFound,
                        "The requested resource was not found.",
                        null
                    );

                case InvalidOperationException invalidOpEx:
                    return (
                        HttpStatusCode.BadRequest,
                        invalidOpEx.Message,
                        null
                    );

                case ArgumentException argEx:
                    return (
                        HttpStatusCode.BadRequest,
                        argEx.Message,
                        null
                    );

                default:
                    return (
                        HttpStatusCode.InternalServerError,
                        "An unexpected error occurred. Please try again later.",
                        null
                    );
            }
        }
    }
}