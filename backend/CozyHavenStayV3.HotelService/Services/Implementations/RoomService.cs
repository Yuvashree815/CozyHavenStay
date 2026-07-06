using AutoMapper;
using log4net;
using CozyHavenStayV3.HotelService.DTOs.Room;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Services.Implementations
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IHotelRepository _hotelRepository;
        private readonly IMapper _mapper;
        private readonly IRoomBlockRepository _roomBlockRepository;
        private static readonly ILog Log = LogManager.GetLogger(typeof(RoomService));

        
        private static readonly Dictionary<BedType, int> FreeOccupancy = new()
        {
            { BedType.Single, 1 },
            { BedType.Double, 2 },
            { BedType.King, 4 }
        };

        
        private static readonly Dictionary<BedType, int> MaxOccupancyByBedType = new()
        {
            { BedType.Single, 2 },
            { BedType.Double, 4 },
            { BedType.King, 6 }
        };

        private const decimal AdultSurchargeRate = 0.40m;
        private const decimal ChildSurchargeRate = 0.20m;
        private const int ChildAgeThreshold = 14;

        public RoomService(
                    IRoomRepository roomRepository,
                    IHotelRepository hotelRepository,
                    IRoomBlockRepository roomBlockRepository,
                    IMapper mapper)
        {
            _roomRepository = roomRepository;
            _hotelRepository = hotelRepository;
            _roomBlockRepository = roomBlockRepository;
            _mapper = mapper;
        }

        public async Task<RoomDto> CreateRoomAsync(int hotelId, int ownerId, CreateRoomDto dto)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId)
                ?? throw new KeyNotFoundException("Hotel not found.");

            if (hotel.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("You do not have permission to add rooms to this hotel.");
            }

            var room = _mapper.Map<Room>(dto);
            room.HotelId = hotelId;
            room.MaxOccupancy = MaxOccupancyByBedType[dto.BedType];
            room.IsActive = true;

            await _roomRepository.AddAsync(room);
            Log.Info($"Room created for hotel {hotelId} by owner {ownerId}: {dto.BedType}, base fare {dto.BaseFare}.");

            return _mapper.Map<RoomDto>(room);
        }

        public async Task<RoomDto> UpdateRoomAsync(int roomId, int ownerId, UpdateRoomDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            if (room.Hotel.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("You do not have permission to edit this room.");
            }

            room.RoomSize = dto.RoomSize;
            room.BedType = dto.BedType;
            room.MaxOccupancy = MaxOccupancyByBedType[dto.BedType];
            room.IsAC = dto.IsAC;
            room.BaseFare = dto.BaseFare;

            await _roomRepository.UpdateAsync(room);
            Log.Info($"Room {roomId} updated by owner {ownerId}.");

            return _mapper.Map<RoomDto>(room);
        }

        public async Task DeleteRoomAsync(int roomId, int ownerId)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            if (room.Hotel.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("You do not have permission to delete this room.");
            }

            room.IsActive = false;
            await _roomRepository.UpdateAsync(room);
            Log.Info($"Room {roomId} deactivated by owner {ownerId}.");
        }

        public async Task<List<RoomDto>> GetByHotelIdAsync(int hotelId)
        {
            var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
            return _mapper.Map<List<RoomDto>>(rooms);
        }

        public async Task<RoomDto> GetByIdAsync(int roomId)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            return _mapper.Map<RoomDto>(room);
        }

        public async Task<FareCalculationResponseDto> CalculateFareAsync(int roomId, FareCalculationRequestDto request)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            if (request.CheckOut <= request.CheckIn)
                throw new ArgumentException("Check-out date must be after check-in date.");

            var numberOfNights = (request.CheckOut.Date - request.CheckIn.Date).Days;
            var freeOccupancy = FreeOccupancy[room.BedType];
            var totalGuests = request.AllGuestAges.Count;

            if (totalGuests > room.MaxOccupancy)
            {
                return new FareCalculationResponseDto
                {
                    RoomId = roomId,
                    BaseFare = room.BaseFare,
                    NumberOfNights = numberOfNights,
                    TotalGuests = totalGuests,
                    FreeOccupancy = freeOccupancy,
                    PerNightSurcharge = 0,
                    SurchargeAmount = 0,
                    TotalFare = 0,
                    ExceedsMaxOccupancy = true
                };
            }

            // Step 1 — Children 5 and under are always free
            var alwaysFreeCount = request.AllGuestAges.Count(a => a <= 5);

            // Step 2 — Remaining guests (age > 5), adults fill free slots first
            var remainingGuests = request.AllGuestAges
                .Where(a => a > 5)
                .OrderByDescending(a => a) // adults (highest age) fill free slots first
                .ToList();

            // Step 3 — Adjust free occupancy after always-free children
            var adjustedFreeOccupancy = Math.Max(0, freeOccupancy - alwaysFreeCount);

            // Step 4 — Anyone beyond adjusted free occupancy gets surcharged
            var extraGuests = remainingGuests.Skip(adjustedFreeOccupancy).ToList();

            // Step 5 — Calculate per-night surcharge
            decimal perNightSurcharge = 0;
            foreach (var age in extraGuests)
            {
                var rate = age > ChildAgeThreshold ? AdultSurchargeRate : ChildSurchargeRate;
                perNightSurcharge += room.BaseFare * rate;
            }

            var totalSurcharge = perNightSurcharge * numberOfNights;
            var perNightTotal = room.BaseFare + perNightSurcharge;
            var totalFare = perNightTotal * numberOfNights;

            return new FareCalculationResponseDto
            {
                RoomId = roomId,
                BaseFare = room.BaseFare,
                NumberOfNights = numberOfNights,
                TotalGuests = totalGuests,
                FreeOccupancy = freeOccupancy,
                PerNightSurcharge = perNightSurcharge,
                SurchargeAmount = totalSurcharge,
                TotalFare = totalFare,
                ExceedsMaxOccupancy = false
            };
        }
        public async Task<List<RoomAvailabilityDto>> GetAvailableRoomsAsync(int hotelId, DateTime checkIn, DateTime checkOut)
        {
            var hotel = await _hotelRepository.GetByIdAsync(hotelId)
                ?? throw new KeyNotFoundException("Hotel not found.");

            if (checkOut <= checkIn)
            {
                throw new ArgumentException("Check-out date must be after check-in date.");
            }

            var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
            var result = new List<RoomAvailabilityDto>();

            foreach (var room in rooms)
            {
                var hasOverlap = await _roomBlockRepository.HasOverlappingBlockAsync(room.Id, checkIn, checkOut);

                result.Add(new RoomAvailabilityDto
                {
                    Id = room.Id,
                    HotelId = room.HotelId,
                    RoomSize = room.RoomSize,
                    BedType = room.BedType,
                    MaxOccupancy = room.MaxOccupancy,
                    IsAC = room.IsAC,
                    BaseFare = room.BaseFare,
                    IsAvailable = !hasOverlap
                });
            }

            return result;
        }
    }
}