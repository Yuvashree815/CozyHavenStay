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

        public async Task<RoomBlock?> GetByBookingReferenceIdAsync(int bookingReferenceId)
        {
            return await _context.RoomBlocks
                .FirstOrDefaultAsync(rb => rb.BookingReferenceId == bookingReferenceId);
        }

        public async Task<string?> GetOverlappingBlockSourceAsync(int roomId, DateTime checkIn, DateTime checkOut)
        {
            var block = await _context.RoomBlocks
                .Where(b => b.RoomId == roomId &&
                            b.CheckIn < checkOut &&
                            b.CheckOut > checkIn)
                .FirstOrDefaultAsync();

            return block?.Source.ToString();
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
        public async Task<RoomBlock?> GetByIdAsync(int blockId)
        {
            return await _context.RoomBlocks
                .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
                .FirstOrDefaultAsync(b => b.Id == blockId);
        }

        public async Task<List<RoomBlock>> GetByRoomIdAsync(int roomId)
        {
            return await _context.RoomBlocks
                .Where(b => b.RoomId == roomId && b.CheckOut >= DateTime.UtcNow)
                .OrderBy(b => b.CheckIn)
                .ToListAsync();
        }
    }
}