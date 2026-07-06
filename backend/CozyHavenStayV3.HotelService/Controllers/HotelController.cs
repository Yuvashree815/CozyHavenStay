using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.HotelService.Common;
using CozyHavenStayV3.HotelService.DTOs.Hotel;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Services.Interfaces;

namespace CozyHavenStayV3.HotelService.Controllers
{
    [ApiController]
    [Route("api/v1/hotels")]
    public class HotelController : ControllerBase
    {
        private readonly IHotelManagementService _hotelService;
        private readonly IValidator<CreateHotelDto> _createValidator;
        private readonly IValidator<UpdateHotelDto> _updateValidator;

        public HotelController(
            IHotelManagementService hotelService,
            IValidator<CreateHotelDto> createValidator,
            IValidator<UpdateHotelDto> updateValidator)
        {
            _hotelService = hotelService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        
        [HttpGet("search")]
        public async Task<ActionResult<PagedResult<HotelSummaryDto>>> Search(
            [FromQuery] string location, [FromQuery] PaginationQuery query)
        {
            var result = await _hotelService.SearchByLocationAsync(location, query.PageNumber, query.PageSize);
            return Ok(result);
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDto>> GetById(int id)
        {
            var hotel = await _hotelService.GetByIdAsync(id);
            return Ok(hotel);
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<HotelDto>> Create([FromBody] CreateHotelDto dto)
        {
            await _createValidator.ValidateAndThrowAsync(dto);
            var ownerId = GetCurrentUserId();
            var hotel = await _hotelService.CreateHotelAsync(ownerId, dto);
            return StatusCode(StatusCodes.Status201Created, hotel);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<HotelDto>> Update(int id, [FromBody] UpdateHotelDto dto)
        {
            await _updateValidator.ValidateAndThrowAsync(dto);
            var ownerId = GetCurrentUserId();
            var hotel = await _hotelService.UpdateHotelAsync(id, ownerId, dto);
            return Ok(hotel);
        }

        [HttpGet("filter")]
        [AllowAnonymous]
        public async Task<IActionResult> FilterHotels(
        [FromQuery] string? location,
        [FromQuery] bool? hasFreeWifi,
        [FromQuery] bool? hasDining,
        [FromQuery] bool? hasParking,
        [FromQuery] bool? hasSwimmingPool,
        [FromQuery] bool? hasFitnessCenter,
        [FromQuery] bool? hasRoomService,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
        {
            var result = await _hotelService.FilterHotelsAsync(
                location, hasFreeWifi, hasDining, hasParking,
                hasSwimmingPool, hasFitnessCenter, hasRoomService,
                pageNumber, pageSize);

            return Ok(result);
        }

        [HttpGet("my-hotels")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<List<HotelDto>>> GetMyHotels()
        {
            var ownerId = GetCurrentUserId();
            var hotels = await _hotelService.GetMyHotelsAsync(ownerId);
            return Ok(hotels);
        }

        [HttpGet("{id}/is-owned-by/{ownerId}")]
        public async Task<ActionResult<bool>> IsOwnedBy(int id, int ownerId)
        {
            var isOwned = await _hotelService.IsOwnedByAsync(id, ownerId);
            return Ok(new { hotelId = id, ownerId, isOwned });
        }

        [HttpGet("owned-by/{ownerId}")]
        public async Task<ActionResult<List<int>>> GetOwnedHotelIds(int ownerId)
        {
            var hotelIds = await _hotelService.GetOwnedHotelIdsAsync(ownerId);
            return Ok(hotelIds);
        }

        [HttpGet]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<PagedResult<HotelDto>>> GetAllForAdmin([FromQuery] PaginationQuery query)
        {
            var result = await _hotelService.GetAllForAdminAsync(query.PageNumber, query.PageSize);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _hotelService.DeactivateHotelAsync(id);
            return NoContent();
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