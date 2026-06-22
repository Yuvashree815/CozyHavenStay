namespace CozyHavenStayV3.ReviewService.DTOs
{
    public class HotelRatingSummaryDto
    {
        public int HotelId { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }
}