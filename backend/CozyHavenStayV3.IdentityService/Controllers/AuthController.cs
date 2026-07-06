using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.IdentityService.DTOs.Auth;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IValidator<LoginRequestDto> _loginValidator;

        public AuthController(IAuthService authService, IValidator<LoginRequestDto> loginValidator)
        {
            _authService = authService;
            _loginValidator = loginValidator;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            await _loginValidator.ValidateAndThrowAsync(request);

            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
    }
}