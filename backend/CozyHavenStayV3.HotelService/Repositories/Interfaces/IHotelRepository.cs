using CozyHavenStayV3.HotelService.Common;
using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Repositories.Interfaces
{
    public interface IHotelRepository
    {
        Task<Hotel?> GetByIdAsync(int id);
        Task<Hotel?> GetByIdWithRoomsAsync(int id);
        Task<List<Hotel>> SearchByLocationAsync(string location, int pageNumber, int pageSize);
        Task<bool> ExistsByNameAndLocationAsync(string name, string location, int ownerId);
        Task<int> CountByLocationAsync(string location);
        Task<List<Hotel>> GetByOwnerIdAsync(int ownerId);
        Task<List<Hotel>> GetAllAsync(int pageNumber, int pageSize);
        Task<int> GetTotalCountAsync();
        Task AddAsync(Hotel hotel);
        Task UpdateAsync(Hotel hotel);
        Task<PagedResult<Hotel>> FilterHotelsAsync(
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