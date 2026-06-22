using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FluentValidation;
using log4net;
using log4net.Config;
using CozyHavenStayV3.IdentityService.Data;
using CozyHavenStayV3.IdentityService.Mapping;
using CozyHavenStayV3.IdentityService.Middleware;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Implementations;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Implementations;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            //  log4net 
            var logRepository = LogManager.GetRepository(System.Reflection.Assembly.GetEntryAssembly());
            XmlConfigurator.Configure(logRepository, new FileInfo("log4net.config"));

            //  DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            //  Repositories 
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();

            //  Services 
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IAccountService, AccountService>();
            builder.Services.AddScoped<ITokenService, TokenService>();

            //  AutoMapper 
            builder.Services.AddAutoMapper(typeof(UserMappingProfile));

            //  FluentValidation 
            builder.Services.AddValidatorsFromAssemblyContaining<Program>();

            // JWT Authentication 
            var jwtSection = builder.Configuration.GetSection("Jwt");
            var jwtSecret = jwtSection["Secret"]!;

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidAudience = jwtSection["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    NameClaimType = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub
                };
            });

            builder.Services.AddAuthorization();

            
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Controllers
            builder.Services.AddControllers();

            // Swagger 
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CozyHavenStayV3 - Identity Service",
                    Version = "v1"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter: Bearer {your JWT token}"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await context.Database.MigrateAsync();
                await SeedBootstrapAdminAsync(context, builder.Configuration);
            }

            // Middleware pipeline 
            app.UseMiddleware<GlobalExceptionMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }

        private static async Task SeedBootstrapAdminAsync(ApplicationDbContext context, IConfiguration configuration)
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleNames.Admin);
            if (adminRole is null) return;

            var anyAdminExists = await context.Users.AnyAsync(u => u.RoleId == adminRole.Id);
            if (anyAdminExists) return;

            var adminConfig = configuration.GetSection("BootstrapAdmin");
            var hasher = new PasswordHasher<User>();

            var admin = new User
            {
                FullName = adminConfig["FullName"]!,
                Email = adminConfig["Email"]!,
                Gender = adminConfig["Gender"]!,
                PhoneNumber = adminConfig["PhoneNumber"]!,
                Address = adminConfig["Address"]!,
                RoleId = adminRole.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            admin.PasswordHash = hasher.HashPassword(admin, adminConfig["Password"]!);

            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}