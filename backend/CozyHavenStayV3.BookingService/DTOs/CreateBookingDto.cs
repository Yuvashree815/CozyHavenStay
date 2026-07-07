namespace CozyHavenStayV3.BookingService.DTOs
{
    public class CreateBookingDto
    {
        public int HotelId { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfAdults { get; set; }
        public int NumberOfChildren { get; set; }
        public string GuestEmail { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public List<int> GuestAges { get; set; } = new();
        public PaymentMethodDto PaymentMethod { get; set; }
    }

    public enum PaymentMethodDto
    {
        CreditCard,
        DebitCard,
        UPI,
        NetBanking
    }
}