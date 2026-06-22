using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.Repositories.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(int id);
        Task<Booking?> GetByIdWithDetailsAsync(int id);
        Task<List<Booking>> GetByUserIdAsync(int userId, int pageNumber, int pageSize);
        Task<int> CountByUserIdAsync(int userId);
        Task<List<Booking>> GetByHotelIdAsync(int hotelId);
        Task<List<Booking>> GetCancelledWithPendingRefundsAsync();
        Task AddAsync(Booking booking);
        Task UpdateAsync(Booking booking);
    }
}