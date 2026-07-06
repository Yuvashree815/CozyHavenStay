using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Repositories.Interfaces
{
    public interface IRoomRepository
    {
        Task<Room?> GetByIdAsync(int id);
        Task<Room?> GetByIdWithBlocksAsync(int id);
        Task<List<Room>> GetByHotelIdAsync(int hotelId);
        Task AddAsync(Room room);
        Task UpdateAsync(Room room);
        Task DeleteAsync(Room room);
    }
}