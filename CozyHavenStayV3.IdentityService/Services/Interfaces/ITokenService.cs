using CozyHavenStayV3.IdentityService.Models;

namespace CozyHavenStayV3.IdentityService.Services.Interfaces
{
    public interface ITokenService
    {
        (string token, DateTime expiresAtUtc) GenerateAccessToken(User user);
    }
}