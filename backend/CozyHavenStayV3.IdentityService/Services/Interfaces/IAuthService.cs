using CozyHavenStayV3.IdentityService.DTOs.Auth;

namespace CozyHavenStayV3.IdentityService.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task ForgotPasswordAsync(string email, string frontendBaseUrl);
        Task ResetPasswordAsync(string token, string newPassword, string confirmPassword);
    }
}