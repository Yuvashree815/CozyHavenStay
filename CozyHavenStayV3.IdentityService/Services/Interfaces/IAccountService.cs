using CozyHavenStayV3.IdentityService.Common;
using CozyHavenStayV3.IdentityService.DTOs.Account;

namespace CozyHavenStayV3.IdentityService.Services.Interfaces
{
    public interface IAccountService
    {
        Task RegisterUserAsync(RegisterUserDto dto);
        Task RegisterHotelOwnerAsync(RegisterHotelOwnerDto dto);
        Task RegisterAdminAsync(RegisterAdminDto dto);
        Task<UserProfileDto> GetProfileAsync(int userId);
        Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<PagedResult<UserListDto>> GetAllUsersAsync(int pageNumber, int pageSize);
        Task DeactivateUserAsync(int userId);
    }
}