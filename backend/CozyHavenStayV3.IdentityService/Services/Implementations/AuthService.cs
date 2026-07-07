using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using log4net;
using CozyHavenStayV3.IdentityService.Data;
using CozyHavenStayV3.IdentityService.DTOs.Auth;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Implementations;

namespace CozyHavenStayV3.IdentityService.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;
        private static readonly ILog Log = LogManager.GetLogger(typeof(AuthService));

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IEmailService emailService,
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _emailService = emailService;
            _context = context;
            _configuration = configuration;
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
                throw new UnauthorizedAccessException(
                    "This account has been deactivated. Please contact support.");
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(
                user, user.PasswordHash, request.Password);

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

        public async Task ForgotPasswordAsync(string email, string frontendBaseUrl)
        {
            var user = await _userRepository.GetByEmailAsync(email);

            // Always return success — don't reveal if email exists (security)
            if (user == null || !user.IsActive)
            {
                Log.Info($"Forgot password requested for non-existent or inactive email: {email}");
                return;
            }

            // Invalidate any existing unused tokens for this user
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed)
                .ToListAsync();

            foreach (var t in existingTokens)
                t.IsUsed = true;

            // Generate secure random token
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var expiresAt = DateTime.UtcNow.AddHours(1);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiresAt = expiresAt,
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var resetLink = $"{frontendBaseUrl}/reset-password?token={token}";
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);

            Log.Info($"Password reset email sent to {email}.");
        }

        public async Task ResetPasswordAsync(
            string token, string newPassword, string confirmPassword)
        {
            if (newPassword != confirmPassword)
                throw new ArgumentException("Passwords do not match.");

            var resetToken = await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken == null)
                throw new KeyNotFoundException("Invalid or expired reset token.");

            if (resetToken.IsUsed)
                throw new InvalidOperationException(
                    "This reset link has already been used. Please request a new one.");

            if (resetToken.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException(
                    "This reset link has expired. Please request a new one.");

            if (!resetToken.User.IsActive)
                throw new InvalidOperationException(
                    "This account has been deactivated.");

            // Hash and update password
            var hasher = new PasswordHasher<User>();
            resetToken.User.PasswordHash = hasher.HashPassword(
                resetToken.User, newPassword);

            // Mark token as used
            resetToken.IsUsed = true;

            await _context.SaveChangesAsync();

            Log.Info($"Password reset successfully for user {resetToken.User.Email}.");
        }
    }
}