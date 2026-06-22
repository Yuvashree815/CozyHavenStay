namespace CozyHavenStayV3.BookingService.Models
{
    public class BookingGuest
    {
        public int Id { get; set; }

        public int BookingId { get; set; }
        public Booking Booking { get; set; } = null!;

        public int Age { get; set; }
    }
}