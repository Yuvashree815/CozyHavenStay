using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.HotelService.Data;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;

namespace CozyHavenStayV3.HotelService.Repositories.Implementations
{
    public class HotelRepository : IHotelRepository
    {
        private readonly ApplicationDbContext _context;

        public HotelRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Hotel?> GetByIdAsync(int id)
        {
            return await _context.Hotels.FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<Hotel?> GetByIdWithRoomsAsync(int id)
        {
            return await _context.Hotels
                .Include(h => h.Rooms)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<List<Hotel>> SearchByLocationAsync(string location, int pageNumber, int pageSize)
        {
            return await _context.Hotels
                .Where(h => h.IsActive && h.Location.Contains(location))
                .OrderBy(h => h.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountByLocationAsync(string location)
        {
            return await _context.Hotels
                .Where(h => h.IsActive && h.Location.Contains(location))
                .CountAsync();
        }

        public async Task<List<Hotel>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Hotels
                .Where(h => h.OwnerId == ownerId)
                .Include(h => h.Rooms)
                .ToListAsync();
        }

        public async Task<List<Hotel>> GetAllAsync(int pageNumber, int pageSize)
        {
            return await _context.Hotels
                .OrderBy(h => h.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.Hotels.CountAsync();
        }

        public async Task AddAsync(Hotel hotel)
        {
            await _context.Hotels.AddAsync(hotel);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Hotel hotel)
        {
            _context.Hotels.Update(hotel);
            await _context.SaveChangesAsync();
        }
    }
}