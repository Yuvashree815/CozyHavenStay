using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Repositories.Interfaces
{
    public interface IRoomBlockRepository
    {
        Task<bool> HasOverlappingBlockAsync(int roomId, DateTime checkIn, DateTime checkOut);
        Task<List<RoomBlock>> GetByRoomIdAsync(int roomId);
        Task<RoomBlock?> GetByBookingReferenceIdAsync(int bookingReferenceId);
        Task AddAsync(RoomBlock block);
        Task RemoveAsync(RoomBlock block);
        Task<RoomBlock?> GetByIdAsync(int blockId);
        Task<string?> GetOverlappingBlockSourceAsync(int roomId, DateTime checkIn, DateTime checkOut);
    }
}