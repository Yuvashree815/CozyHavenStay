using CozyHavenStayV3.HotelService.Common;
using CozyHavenStayV3.HotelService.Data;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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

        public async Task<bool> ExistsByNameAndLocationAsync(string name, string location, int ownerId)
        {
            return await _context.Hotels.AnyAsync(h =>
                h.OwnerId == ownerId &&
                h.Name.ToLower() == name.ToLower() &&
                h.Location.ToLower() == location.ToLower() &&
                h.IsActive);
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

        public async Task<PagedResult<Hotel>> FilterHotelsAsync(
    string? location,
    bool? hasFreeWifi,
    bool? hasDining,
    bool? hasParking,
    bool? hasSwimmingPool,
    bool? hasFitnessCenter,
    bool? hasRoomService,
    int pageNumber,
    int pageSize)
        {
            var query = _context.Hotels
                .Where(h => h.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(h =>
                    h.Location.Contains(location) ||
                    h.Name.Contains(location));

            if (hasFreeWifi == true)
                query = query.Where(h => h.HasFreeWifi);

            if (hasDining == true)
                query = query.Where(h => h.HasDining);

            if (hasParking == true)
                query = query.Where(h => h.HasParking);

            if (hasSwimmingPool == true)
                query = query.Where(h => h.HasSwimmingPool);

            if (hasFitnessCenter == true)
                query = query.Where(h => h.HasFitnessCenter);

            if (hasRoomService == true)
                query = query.Where(h => h.HasRoomService);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(h => h.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Hotel>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}