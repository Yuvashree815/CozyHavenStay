using CozyHavenStayV3.BookingService.Common;
using CozyHavenStayV3.BookingService.DTOs;

namespace CozyHavenStayV3.BookingService.Services.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto);
        Task<bool> VerifyCompletedStayAsync(int bookingId, int userId, int hotelId);
        Task<BookingDto> GetByIdAsync(int bookingId, int userId);
        Task<PagedResult<BookingDto>> GetMyBookingsAsync(int userId, int pageNumber, int pageSize);
        Task<BookingDto> CancelBookingAsync(int bookingId, int userId);
        Task<List<BookingDto>> GetByHotelIdAsync(int hotelId, int ownerId);
        Task<List<BookingDto>> GetPendingRefundsAsync(int ownerId);
        Task<RefundPolicyDto> GetRefundPolicyAsync(int bookingId, int userId);
        Task<BookingDto> ApproveRefundAsync(int bookingId, int ownerId);
    }
}