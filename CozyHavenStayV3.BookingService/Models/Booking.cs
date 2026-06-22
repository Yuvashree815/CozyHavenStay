namespace CozyHavenStayV3.BookingService.Models
{
    public class Booking
    {
        public int Id { get; set; }

        
        public int UserId { get; set; }

        
        public int HotelId { get; set; }
        public int RoomId { get; set; }

        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }

        public int NumberOfAdults { get; set; }
        public int NumberOfChildren { get; set; }

        
        public decimal BaseFare { get; set; }
        public decimal SurchargeAmount { get; set; }
        public decimal TotalFare { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<BookingGuest> Guests { get; set; } = new List<BookingGuest>();
        public Payment Payment { get; set; } = null!;
    }
}