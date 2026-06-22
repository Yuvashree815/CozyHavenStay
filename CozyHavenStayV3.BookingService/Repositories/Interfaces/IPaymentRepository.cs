using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByBookingIdAsync(int bookingId);
        Task AddAsync(Payment payment);
        Task UpdateAsync(Payment payment);
    }
}