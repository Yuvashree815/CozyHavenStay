using Ocelot.DependencyInjection;
using Ocelot.Middleware;

namespace CozyHavenStayV3.Gateway
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

            builder.Services.AddOcelot(builder.Configuration);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                });
            });

            var app = builder.Build();

            app.UseCors("AllowAll");

            await app.UseOcelot();

            app.Run();
        }
    }
}