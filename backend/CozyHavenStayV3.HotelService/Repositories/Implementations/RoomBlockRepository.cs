using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.HotelService.Data;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;

namespace CozyHavenStayV3.HotelService.Repositories.Implementations
{
    public class RoomBlockRepository : IRoomBlockRepository
    {
        private readonly ApplicationDbContext _context;

        public RoomBlockRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasOverlappingBlockAsync(int roomId, DateTime checkIn, DateTime checkOut)
        {
            
            return await _context.RoomBlocks
                .AnyAsync(rb => rb.RoomId == roomId
                    && rb.CheckIn < checkOut
                    && rb.CheckOut > checkIn);
        }

        public async Task<List<RoomBlock>> GetByRoomIdAsync(int roomId)
        {
            return await _context.RoomBlocks
                .Where(rb => rb.RoomId == roomId)
                .ToListAsync();
        }

        public async Task<RoomBlock?> GetByBookingReferenceIdAsync(int bookingReferenceId)
        {
            return await _context.RoomBlocks
                .FirstOrDefaultAsync(rb => rb.BookingReferenceId == bookingReferenceId);
        }

        public async Task AddAsync(RoomBlock block)
        {
            await _context.RoomBlocks.AddAsync(block);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(RoomBlock block)
        {
            _context.RoomBlocks.Remove(block);
            await _context.SaveChangesAsync();
        }
    }
}