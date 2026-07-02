namespace CozyHavenStayV3.BookingService.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int BookingId { get; set; }
        public Booking Booking { get; set; } = null!;

        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public decimal? RefundAmount { get; set; }
        public string TransactionReference { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public DateTime? RefundedAt { get; set; }
    }
}