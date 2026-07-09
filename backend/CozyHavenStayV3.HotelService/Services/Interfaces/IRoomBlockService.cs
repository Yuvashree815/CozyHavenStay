using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Services.Interfaces
{
    public interface IRoomBlockService
    {
        
        Task BlockRoomForBookingAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingReferenceId);
        Task ReleaseBookingBlockAsync(int bookingReferenceId);
        Task BlockRoomForMaintenanceAsync(int roomId, int ownerId, DateTime checkIn, DateTime checkOut);
        Task UnblockMaintenanceAsync(int blockId, int ownerId);
        Task<List<RoomBlock>> GetBlocksByRoomIdAsync(int roomId);

        Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut);
    }
}