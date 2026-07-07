using CozyHavenStayV3.IdentityService.DTOs.Auth;
using CozyHavenStayV3.IdentityService.Services.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CozyHavenStayV3.IdentityService.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IValidator<LoginRequestDto> _loginValidator;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IValidator<LoginRequestDto> loginValidator, IConfiguration configuration)
        {
            _authService = authService;
            _loginValidator = loginValidator;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            await _loginValidator.ValidateAndThrowAsync(request);

            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var frontendBaseUrl = _configuration["FrontendBaseUrl"]
                ?? "http://localhost:5173";
            await _authService.ForgotPasswordAsync(dto.Email, frontendBaseUrl);
            return Ok(new
            {
                message = "If an account with that email exists, a reset link has been sent."
            });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await _authService.ResetPasswordAsync(
                dto.Token, dto.NewPassword, dto.ConfirmPassword);
            return Ok(new { message = "Password reset successfully. You can now log in." });
        }
    }
}