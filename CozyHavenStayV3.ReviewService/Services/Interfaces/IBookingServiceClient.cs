namespace CozyHavenStayV3.ReviewService.Services.Interfaces
{
    public interface IBookingServiceClient
    {
        Task<bool> VerifyCompletedStayAsync(int bookingId, int userId, int hotelId);
    }
}