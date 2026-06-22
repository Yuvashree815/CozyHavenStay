using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.BookingService.Data;
using CozyHavenStayV3.BookingService.Models;
using CozyHavenStayV3.BookingService.Repositories.Interfaces;

namespace CozyHavenStayV3.BookingService.Repositories.Implementations
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Booking?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Guests)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetByUserIdAsync(int userId, int pageNumber, int pageSize)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Guests)
                .Include(b => b.Payment)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountByUserIdAsync(int userId)
        {
            return await _context.Bookings.CountAsync(b => b.UserId == userId);
        }

        public async Task<List<Booking>> GetByHotelIdAsync(int hotelId)
        {
            return await _context.Bookings
                .Where(b => b.HotelId == hotelId)
                .Include(b => b.Guests)
                .Include(b => b.Payment)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetCancelledWithPendingRefundsAsync()
        {
            return await _context.Bookings
                .Include(b => b.Payment)
                .Where(b => b.Status == BookingStatus.Cancelled
                    && b.Payment.Status == PaymentStatus.RefundPending)
                .OrderBy(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
        }
    }
}