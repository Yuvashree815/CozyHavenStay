using CozyHavenStayV3.HotelService.Common;
using CozyHavenStayV3.HotelService.DTOs.Hotel;

namespace CozyHavenStayV3.HotelService.Services.Interfaces
{
    public interface IHotelManagementService
    {
        Task<HotelDto> CreateHotelAsync(int ownerId, CreateHotelDto dto);
        Task<bool> IsOwnedByAsync(int hotelId, int ownerId);
        Task<List<int>> GetOwnedHotelIdsAsync(int ownerId);
        Task<HotelDto> UpdateHotelAsync(int hotelId, int ownerId, UpdateHotelDto dto);
        Task<HotelDto> GetByIdAsync(int hotelId);
        Task<PagedResult<HotelSummaryDto>> SearchByLocationAsync(string location, int pageNumber, int pageSize);
        Task<List<HotelDto>> GetMyHotelsAsync(int ownerId);
        Task<PagedResult<HotelDto>> GetAllForAdminAsync(int pageNumber, int pageSize);
        Task DeactivateHotelAsync(int hotelId);
        Task<PagedResult<HotelSummaryDto>> FilterHotelsAsync(
                                            string? location,
                                            bool? hasFreeWifi,
                                            bool? hasDining,
                                            bool? hasParking,
                                            bool? hasSwimmingPool,
                                            bool? hasFitnessCenter,
                                            bool? hasRoomService,
                                            int pageNumber,
                                            int pageSize);
    }
}