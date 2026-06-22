using CozyHavenStayV3.IdentityService.DTOs.Auth;

namespace CozyHavenStayV3.IdentityService.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}