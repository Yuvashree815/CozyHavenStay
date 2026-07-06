namespace CozyHavenStayV3.HotelService.Services.Interfaces
{
    public interface IRoomBlockService
    {
        
        Task BlockRoomForBookingAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingReferenceId);

        
        Task ReleaseBookingBlockAsync(int bookingReferenceId);

        
        Task BlockRoomForMaintenanceAsync(int roomId, int ownerId, DateTime checkIn, DateTime checkOut);

        
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut);
    }
}