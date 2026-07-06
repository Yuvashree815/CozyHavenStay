using Microsoft.AspNetCore.Identity;
using log4net;
using CozyHavenStayV3.IdentityService.DTOs.Auth;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService.Services.Implementations
{
    public class AuthService : IAuthService     
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher;
        private static readonly ILog Log = LogManager.GetLogger(typeof(AuthService));

        public AuthService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            
            if (user is null)
            {
                Log.Warn($"Login failed: no account found for email {request.Email}.");
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (!user.IsActive)
            {
                Log.Warn($"Login blocked: account {request.Email} is deactivated.");
                throw new UnauthorizedAccessException("This account has been deactivated. Please contact support.");
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                Log.Warn($"Login failed: invalid password for email {request.Email}.");
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var (token, expiresAtUtc) = _tokenService.GenerateAccessToken(user);

            Log.Info($"User {user.Email} (Id: {user.Id}) logged in successfully.");

            return new LoginResponseDto
            {
                Token = token,
                ExpiresAtUtc = expiresAtUtc,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.Name
            };
        }
    }
}