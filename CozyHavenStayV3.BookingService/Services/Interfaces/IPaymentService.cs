using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<Payment> ProcessPaymentAsync(int bookingId, decimal amount, PaymentMethod method);
        Task MarkRefundPendingAsync(Payment payment, decimal refundAmount);
        Task<Payment> ApproveRefundAsync(int bookingId);
    }
}