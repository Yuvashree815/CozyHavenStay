using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public DateTime? RefundedAt { get; set; }
    }
}