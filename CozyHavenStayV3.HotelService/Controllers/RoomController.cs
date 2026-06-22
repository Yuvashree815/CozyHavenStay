using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.HotelService.DTOs.Room;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly IValidator<CreateRoomDto> _createValidator;
        private readonly IValidator<UpdateRoomDto> _updateValidator;
        private readonly IValidator<FareCalculationRequestDto> _fareValidator;

        public RoomController(
            IRoomService roomService,
            IValidator<CreateRoomDto> createValidator,
            IValidator<UpdateRoomDto> updateValidator,
            IValidator<FareCalculationRequestDto> fareValidator)
        {
            _roomService = roomService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _fareValidator = fareValidator;
        }

        
        [HttpGet("hotels/{hotelId}/rooms")]
        public async Task<ActionResult<List<RoomDto>>> GetByHotel(int hotelId)
        {
            var rooms = await _roomService.GetByHotelIdAsync(hotelId);
            return Ok(rooms);
        }

        [HttpPost("hotels/{hotelId}/rooms")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<RoomDto>> Create(int hotelId, [FromBody] CreateRoomDto dto)
        {
            await _createValidator.ValidateAndThrowAsync(dto);
            var ownerId = GetCurrentUserId();
            var room = await _roomService.CreateRoomAsync(hotelId, ownerId, dto);
            return StatusCode(StatusCodes.Status201Created, room);
        }

        
        [HttpGet("rooms/{id}")]
        public async Task<ActionResult<RoomDto>> GetById(int id)
        {
            var room = await _roomService.GetByIdAsync(id);
            return Ok(room);
        }

        [HttpGet("hotels/{hotelId}/rooms/availability")]
        public async Task<ActionResult<List<RoomAvailabilityDto>>> GetAvailableRooms(
    int hotelId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            var rooms = await _roomService.GetAvailableRoomsAsync(hotelId, checkIn, checkOut);
            return Ok(rooms);
        }

        [HttpPut("rooms/{id}")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<RoomDto>> Update(int id, [FromBody] UpdateRoomDto dto)
        {
            await _updateValidator.ValidateAndThrowAsync(dto);
            var ownerId = GetCurrentUserId();
            var room = await _roomService.UpdateRoomAsync(id, ownerId, dto);
            return Ok(room);
        }

        [HttpDelete("rooms/{id}")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<IActionResult> Delete(int id)
        {
            var ownerId = GetCurrentUserId();
            await _roomService.DeleteRoomAsync(id, ownerId);
            return NoContent();
        }

        
        [HttpPost("rooms/{id}/calculate-fare")]
        public async Task<ActionResult<FareCalculationResponseDto>> CalculateFare(int id, [FromBody] FareCalculationRequestDto request)
        {
            await _fareValidator.ValidateAndThrowAsync(request);
            var result = await _roomService.CalculateFareAsync(id, request);
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (sub is null || !int.TryParse(sub, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user identity in token.");
            }
            return userId;
        }
    }
}