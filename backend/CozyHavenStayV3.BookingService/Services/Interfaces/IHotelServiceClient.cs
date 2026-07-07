using CozyHavenStayV3.BookingService.DTOs.External;

namespace CozyHavenStayV3.BookingService.Services.Interfaces
{
    public interface IHotelServiceClient
    {
        Task<FareCalculationResponse> CalculateFareAsync(int roomId, FareCalculationRequest request);

        
        Task<List<int>> GetOwnedHotelIdsAsync(int ownerId);
        Task<bool> IsHotelOwnedByAsync(int hotelId, int ownerId);
        Task<bool> CheckAvailabilityAsync(int roomId, DateTime checkIn, DateTime checkOut);
        Task BlockRoomForBookingAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingId);
        Task ReleaseBookingBlockAsync(int roomId, int bookingId);
        Task<HotelInfoResponse?> GetHotelDetailsAsync(int hotelId);
        Task<RoomInfoResponse?> GetRoomDetailsAsync(int roomId);
    }
}