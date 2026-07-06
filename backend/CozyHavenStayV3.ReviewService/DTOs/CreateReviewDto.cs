namespace CozyHavenStayV3.ReviewService.DTOs
{
    public class CreateReviewDto
    {
        public int HotelId { get; set; }
        public int BookingId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}