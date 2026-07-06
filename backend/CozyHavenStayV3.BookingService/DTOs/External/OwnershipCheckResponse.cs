namespace CozyHavenStayV3.BookingService.DTOs.External
{
    public class OwnershipCheckResponse
    {
        public int HotelId { get; set; }
        public int OwnerId { get; set; }
        public bool IsOwned { get; set; }
    }
}