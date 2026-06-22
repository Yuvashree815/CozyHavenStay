using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfAdults { get; set; }
        public int NumberOfChildren { get; set; }
        public List<int> GuestAges { get; set; } = new();
        public decimal BaseFare { get; set; }
        public decimal SurchargeAmount { get; set; }
        public decimal TotalFare { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public PaymentDto? Payment { get; set; }
    }
}