using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CozyHavenStayV3.HotelService.DTOs.Room;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Controllers
{
    [ApiController]
    [Route("api/v1/rooms/{roomId}/blocks")]
    public class RoomBlockController : ControllerBase
    {
        private readonly IRoomBlockService _roomBlockService;

        public RoomBlockController(IRoomBlockService roomBlockService)
        {
            _roomBlockService = roomBlockService;
        }

        [HttpGet("availability")]
        public async Task<ActionResult<bool>> CheckAvailability(
            int roomId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            var isAvailable = await _roomBlockService.IsRoomAvailableAsync(roomId, checkIn, checkOut);
            return Ok(new { roomId, checkIn, checkOut, isAvailable });
        }

        [HttpPost("booking")]
        public async Task<IActionResult> BlockForBooking(
            int roomId, [FromBody] BlockForBookingRequest request)
        {
            await _roomBlockService.BlockRoomForBookingAsync(
                roomId, request.CheckIn, request.CheckOut, request.BookingReferenceId);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpDelete("booking/{bookingReferenceId}")]
        public async Task<IActionResult> ReleaseBookingBlock(
            int roomId, int bookingReferenceId)
        {
            await _roomBlockService.ReleaseBookingBlockAsync(bookingReferenceId);
            return NoContent();
        }

        // GET all current blocks for a room
        [HttpGet]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<IActionResult> GetBlocks(int roomId)
        {
            var blocks = await _roomBlockService.GetBlocksByRoomIdAsync(roomId);
            var result = blocks.Select(b => new MaintenanceBlockDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                CheckIn = b.CheckIn,
                CheckOut = b.CheckOut,
                Source = b.Source.ToString()
            });
            return Ok(result);
        }

        // POST block room for maintenance
        [HttpPost("maintenance")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<IActionResult> BlockForMaintenance(
            int roomId, [FromBody] CreateMaintenanceBlockDto dto)
        {
            var ownerId = GetCurrentUserId();
            await _roomBlockService.BlockRoomForMaintenanceAsync(
                roomId, ownerId, dto.CheckIn, dto.CheckOut);
            return Ok(new { message = "Room blocked for maintenance successfully." });
        }

        // DELETE remove a maintenance block
        [HttpDelete("maintenance/{blockId}")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<IActionResult> UnblockMaintenance(int roomId, int blockId)
        {
            var ownerId = GetCurrentUserId();
            await _roomBlockService.UnblockMaintenanceAsync(blockId, ownerId);
            return Ok(new { message = "Room unblocked successfully." });
        }

        private int GetCurrentUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
            if (sub is null || !int.TryParse(sub, out var userId))
                throw new UnauthorizedAccessException(
                    "Invalid or missing user identity in token.");
            return userId;
        }
    }

    public record BlockForBookingRequest(DateTime CheckIn, DateTime CheckOut, int BookingReferenceId);
}