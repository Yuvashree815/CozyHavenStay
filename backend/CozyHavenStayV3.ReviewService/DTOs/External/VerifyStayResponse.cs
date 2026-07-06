namespace CozyHavenStayV3.ReviewService.DTOs.External
{
    public class VerifyStayResponse
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public bool IsVerified { get; set; }
    }
}