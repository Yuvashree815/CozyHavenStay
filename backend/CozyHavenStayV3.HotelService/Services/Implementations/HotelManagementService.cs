using AutoMapper;
using log4net;
using CozyHavenStayV3.HotelService.Common;
using CozyHavenStayV3.HotelService.DTOs.Hotel;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Services.Implementations
{
    public class HotelManagementService : IHotelManagementService
    {
        private readonly IHotelRepository _hotelRepository;
        private readonly IMapper _mapper;
        private static readonly ILog Log = LogManager.GetLogger(typeof(HotelManagementService));

        public HotelManagementService(IHotelRepository hotelRepository, IMapper mapper)
        {
            _hotelRepository = hotelRepository;
            _mapper = mapper;
        }

        public async Task<HotelDto> CreateHotelAsync(int ownerId, CreateHotelDto dto)
        {
            // Duplicate check — same owner can't have two active hotels
            // with identical name AND location
            var isDuplicate = await _hotelRepository.ExistsByNameAndLocationAsync(
                dto.Name, dto.Location, ownerId);

            if (isDuplicate)
            {
                throw new InvalidOperationException(
                    "You already have an active hotel with this name and location.");
            }

            var hotel = _mapper.Map<Hotel>(dto);
            hotel.OwnerId = ownerId;
            hotel.CreatedAt = DateTime.UtcNow;
            hotel.IsActive = true;

            await _hotelRepository.AddAsync(hotel);
            Log.Info($"Hotel '{hotel.Name}' created by owner {ownerId} (Id: {hotel.Id}).");

            return _mapper.Map<HotelDto>(hotel);
        }
        public async Task<bool> IsOwnedByAsync(int hotelId, int ownerId)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId);
            return hotel is not null && hotel.OwnerId == ownerId;
        }

        public async Task<List<int>> GetOwnedHotelIdsAsync(int ownerId)
        {
            var hotels = await _hotelRepository.GetByOwnerIdAsync(ownerId);
            return hotels.Select(h => h.Id).ToList();
        }
        public async Task<HotelDto> UpdateHotelAsync(int hotelId, int ownerId, UpdateHotelDto dto)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId)
                ?? throw new KeyNotFoundException("Hotel not found.");

            if (hotel.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("You do not have permission to edit this hotel.");
            }

            hotel.Name = dto.Name;
            hotel.Name = dto.Name;
            hotel.Location = dto.Location;
            hotel.Description = dto.Description;
            hotel.HasDining = dto.HasDining;
            hotel.HasParking = dto.HasParking;
            hotel.HasFreeWifi = dto.HasFreeWifi;
            hotel.HasRoomService = dto.HasRoomService;
            hotel.HasSwimmingPool = dto.HasSwimmingPool;
            hotel.HasFitnessCenter = dto.HasFitnessCenter;
            hotel.ImageUrl = dto.ImageUrl;

            await _hotelRepository.UpdateAsync(hotel);
            Log.Info($"Hotel {hotelId} updated by owner {ownerId}.");

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task<HotelDto> GetByIdAsync(int hotelId)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId)
                ?? throw new KeyNotFoundException("Hotel not found.");

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task<PagedResult<HotelSummaryDto>> SearchByLocationAsync(string location, int pageNumber, int pageSize)
        {
            var totalCount = await _hotelRepository.CountByLocationAsync(location);
            var hotels = await _hotelRepository.SearchByLocationAsync(location, pageNumber, pageSize);

            return new PagedResult<HotelSummaryDto>
            {
                Items = _mapper.Map<List<HotelSummaryDto>>(hotels),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<List<HotelDto>> GetMyHotelsAsync(int ownerId)
        {
            var hotels = await _hotelRepository.GetByOwnerIdAsync(ownerId);
            return _mapper.Map<List<HotelDto>>(hotels);
        }

        public async Task<PagedResult<HotelDto>> GetAllForAdminAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _hotelRepository.GetTotalCountAsync();
            var hotels = await _hotelRepository.GetAllAsync(pageNumber, pageSize);

            return new PagedResult<HotelDto>
            {
                Items = _mapper.Map<List<HotelDto>>(hotels),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task DeactivateHotelAsync(int hotelId)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId)
                ?? throw new KeyNotFoundException("Hotel not found.");

            hotel.IsActive = false;
            await _hotelRepository.UpdateAsync(hotel);
            Log.Info($"Hotel {hotelId} deactivated.");
        }

        public async Task<PagedResult<HotelSummaryDto>> FilterHotelsAsync(
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
            pageSize = Math.Min(pageSize, 100);

            var result = await _hotelRepository.FilterHotelsAsync(
                location, hasFreeWifi, hasDining, hasParking,
                hasSwimmingPool, hasFitnessCenter, hasRoomService,
                pageNumber, pageSize);

            return new PagedResult<HotelSummaryDto>
            {
                Items = _mapper.Map<List<HotelSummaryDto>>(result.Items),
                TotalCount = result.TotalCount,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize
            };
        }
    }
}