using CozyHavenStayV3.ReviewService.Models;

namespace CozyHavenStayV3.ReviewService.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(int id);
        Task<bool> ExistsForBookingAsync(int bookingId);
        Task<List<Review>> GetByHotelIdAsync(int hotelId, int pageNumber, int pageSize);
        Task<int> CountByHotelIdAsync(int hotelId);
        Task<double> GetAverageRatingAsync(int hotelId);
        Task AddAsync(Review review);
    }
}