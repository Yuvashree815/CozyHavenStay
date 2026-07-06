using log4net;
using CozyHavenStayV3.BookingService.Models;
using CozyHavenStayV3.BookingService.Repositories.Interfaces;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Services.Implementations
{
    public class PaymentManagementService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private static readonly ILog Log = LogManager.GetLogger(typeof(PaymentManagementService));

        public PaymentManagementService(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Payment> ProcessPaymentAsync(int bookingId, decimal amount, PaymentMethod method)
        {
            
            var payment = new Payment
            {
                BookingId = bookingId,
                Amount = amount,
                Method = method,
                Status = PaymentStatus.Completed,
                TransactionReference = $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}",
                TransactionDate = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);
            Log.Info($"Payment {payment.Id} completed for booking {bookingId}, amount {amount}.");

            return payment;
        }

        public async Task MarkRefundPendingAsync(Payment payment, decimal refundAmount)
        {
            payment.Status = PaymentStatus.RefundPending;
            payment.RefundAmount = refundAmount;
            await _paymentRepository.UpdateAsync(payment);
            Log.Info($"Payment {payment.Id} marked as RefundPending. Refund amount: {refundAmount}");
        }

        public async Task<Payment> ApproveRefundAsync(int bookingId)
        {
            var payment = await _paymentRepository.GetByBookingIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Payment not found for this booking.");

            if (payment.Status != PaymentStatus.RefundPending)
            {
                throw new InvalidOperationException("This booking does not have a pending refund.");
            }

            payment.Status = PaymentStatus.Refunded;
            payment.RefundedAt = DateTime.UtcNow;
            await _paymentRepository.UpdateAsync(payment);

            Log.Info($"Refund approved for booking {bookingId}, payment {payment.Id}.");

            return payment;
        }
    }
}