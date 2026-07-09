using log4net;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Services.Implementations
{
    public class RoomBlockService : IRoomBlockService
    {
        private readonly IRoomBlockRepository _roomBlockRepository;
        private readonly IRoomRepository _roomRepository;
        private static readonly ILog Log = LogManager.GetLogger(typeof(RoomBlockService));

        public RoomBlockService(IRoomBlockRepository roomBlockRepository, IRoomRepository roomRepository)
        {
            _roomBlockRepository = roomBlockRepository;
            _roomRepository = roomRepository;
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut)
        {
            if (checkOut <= checkIn)
            {
                throw new ArgumentException("Check-out date must be after check-in date.");
            }

            var hasOverlap = await _roomBlockRepository.HasOverlappingBlockAsync(roomId, checkIn, checkOut);
            return !hasOverlap;
        }

        public async Task BlockRoomForBookingAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingReferenceId)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            var hasOverlap = await _roomBlockRepository.HasOverlappingBlockAsync(roomId, checkIn, checkOut);
            if (hasOverlap)
            {
                throw new InvalidOperationException("This room is no longer available for the selected dates.");
            }

            var block = new RoomBlock
            {
                RoomId = roomId,
                CheckIn = checkIn,
                CheckOut = checkOut,
                Source = BlockSource.Booking,
                BookingReferenceId = bookingReferenceId,
                CreatedAt = DateTime.UtcNow
            };

            await _roomBlockRepository.AddAsync(block);
            Log.Info($"Room {roomId} blocked for booking {bookingReferenceId}: {checkIn:yyyy-MM-dd} to {checkOut:yyyy-MM-dd}.");
        }

        public async Task ReleaseBookingBlockAsync(int bookingReferenceId)
        {
            var block = await _roomBlockRepository.GetByBookingReferenceIdAsync(bookingReferenceId);
            if (block is null)
            {
                Log.Warn($"No room block found for booking reference {bookingReferenceId} during release.");
                return;
            }

            await _roomBlockRepository.RemoveAsync(block);
            Log.Info($"Released room block for cancelled booking {bookingReferenceId}.");
        }

        public async Task BlockRoomForMaintenanceAsync(int roomId, int ownerId, DateTime checkIn, DateTime checkOut)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new KeyNotFoundException("Room not found.");

            if (room.Hotel.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException("You do not have permission to manage this room.");
            }

            if (checkOut <= checkIn)
            {
                throw new ArgumentException("Check-out date must be after check-in date.");
            }

            var hasOverlap = await _roomBlockRepository.HasOverlappingBlockAsync(roomId, checkIn, checkOut);
            if (hasOverlap)
            {
                throw new InvalidOperationException("This room already has a conflicting block for the selected dates.");
            }

            var block = new RoomBlock
            {
                RoomId = roomId,
                CheckIn = checkIn,
                CheckOut = checkOut,
                Source = BlockSource.Maintenance,
                BookingReferenceId = null,
                CreatedAt = DateTime.UtcNow
            };

            await _roomBlockRepository.AddAsync(block);
            Log.Info($"Room {roomId} blocked for maintenance by owner {ownerId}: {checkIn:yyyy-MM-dd} to {checkOut:yyyy-MM-dd}.");
        }

        public async Task UnblockMaintenanceAsync(int blockId, int ownerId)
        {
            var block = await _roomBlockRepository.GetByIdAsync(blockId)
                ?? throw new KeyNotFoundException("Block not found.");

            if (block.Source != BlockSource.Maintenance)
                throw new InvalidOperationException("Only maintenance blocks can be removed by owners.");

            var room = await _roomRepository.GetByIdAsync(block.RoomId)
                ?? throw new KeyNotFoundException("Room not found.");

            if (room.Hotel.OwnerId != ownerId)
                throw new UnauthorizedAccessException("You do not have permission to manage this room.");

            await _roomBlockRepository.RemoveAsync(block);
            Log.Info($"Maintenance block {blockId} removed by owner {ownerId}.");
        }

        public async Task<List<RoomBlock>> GetBlocksByRoomIdAsync(int roomId)
        {
            return await _roomBlockRepository.GetByRoomIdAsync(roomId);
        }
    }
}