namespace CozyHavenStayV3.BookingService.DTOs
{
    public class RefundPolicyDto
    {
        public int BookingId { get; set; }
        public decimal TotalFare { get; set; }
        public double HoursUntilCheckIn { get; set; }
        public decimal RefundAmount { get; set; }
        public int RefundPercentage { get; set; }
        public string Policy { get; set; } = string.Empty;
    }
}