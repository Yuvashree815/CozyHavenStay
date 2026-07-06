using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.ReviewService.Data;
using CozyHavenStayV3.ReviewService.Models;
using CozyHavenStayV3.ReviewService.Repositories.Interfaces;

namespace CozyHavenStayV3.ReviewService.Repositories.Implementations
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> ExistsForBookingAsync(int bookingId)
        {
            return await _context.Reviews.AnyAsync(r => r.BookingId == bookingId);
        }

        public async Task<List<Review>> GetByHotelIdAsync(int hotelId, int pageNumber, int pageSize)
        {
            return await _context.Reviews
                .Where(r => r.HotelId == hotelId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountByHotelIdAsync(int hotelId)
        {
            return await _context.Reviews.CountAsync(r => r.HotelId == hotelId);
        }

        public async Task<double> GetAverageRatingAsync(int hotelId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.HotelId == hotelId)
                .Select(r => r.Rating)
                .ToListAsync();

            return ratings.Count == 0 ? 0 : ratings.Average();
        }

        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
            await _context.SaveChangesAsync();
        }
    }
}