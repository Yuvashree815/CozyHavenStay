namespace CozyHavenStayV3.BookingService.DTOs.External
{
    public class AvailabilityResponse
    {
        public int RoomId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public bool IsAvailable { get; set; }
    }
}