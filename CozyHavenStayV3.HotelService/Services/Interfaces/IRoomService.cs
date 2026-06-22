using CozyHavenStayV3.HotelService.DTOs.Room;

namespace CozyHavenStayV3.HotelService.Services.Interfaces
{
    public interface IRoomService
    {
        Task<RoomDto> CreateRoomAsync(int hotelId, int ownerId, CreateRoomDto dto);
        Task<RoomDto> UpdateRoomAsync(int roomId, int ownerId, UpdateRoomDto dto);
        Task<List<RoomAvailabilityDto>> GetAvailableRoomsAsync(int hotelId, DateTime checkIn, DateTime checkOut);
        Task DeleteRoomAsync(int roomId, int ownerId);
        Task<List<RoomDto>> GetByHotelIdAsync(int hotelId);
        Task<RoomDto> GetByIdAsync(int roomId);
        Task<FareCalculationResponseDto> CalculateFareAsync(int roomId, FareCalculationRequestDto request);
    }
}