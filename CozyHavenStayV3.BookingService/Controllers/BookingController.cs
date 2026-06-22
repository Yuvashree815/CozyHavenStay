using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.BookingService.Common;
using CozyHavenStayV3.BookingService.DTOs;
using CozyHavenStayV3.BookingService.Models;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Controllers
{
    [ApiController]
    [Route("api/v1/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IValidator<CreateBookingDto> _createValidator;

        public BookingController(IBookingService bookingService, IValidator<CreateBookingDto> createValidator)
        {
            _bookingService = bookingService;
            _createValidator = createValidator;
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.User)]
        public async Task<ActionResult<BookingDto>> Create([FromBody] CreateBookingDto dto)
        {
            await _createValidator.ValidateAndThrowAsync(dto);
            var userId = GetCurrentUserId();
            var booking = await _bookingService.CreateBookingAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, booking);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = RoleNames.User)]
        public async Task<ActionResult<BookingDto>> GetById(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _bookingService.GetByIdAsync(id, userId);
            return Ok(booking);
        }

        [HttpGet("my-bookings")]
        [Authorize(Roles = RoleNames.User)]
        public async Task<ActionResult<PagedResult<BookingDto>>> GetMyBookings([FromQuery] PaginationQuery query)
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.GetMyBookingsAsync(userId, query.PageNumber, query.PageSize);
            return Ok(result);
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Roles = RoleNames.User)]
        public async Task<ActionResult<BookingDto>> Cancel(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _bookingService.CancelBookingAsync(id, userId);
            return Ok(booking);
        }

        [HttpGet("hotel/{hotelId}")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<List<BookingDto>>> GetByHotel(int hotelId)
        {
            var ownerId = GetCurrentUserId();
            var bookings = await _bookingService.GetByHotelIdAsync(hotelId, ownerId);
            return Ok(bookings);
        }

        [HttpGet("pending-refunds")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<List<BookingDto>>> GetPendingRefunds()
        {
            var ownerId = GetCurrentUserId();
            var bookings = await _bookingService.GetPendingRefundsAsync(ownerId);
            return Ok(bookings);
        }

        [HttpPost("{id}/approve-refund")]
        [Authorize(Roles = RoleNames.HotelOwner)]
        public async Task<ActionResult<BookingDto>> ApproveRefund(int id)
        {
            var ownerId = GetCurrentUserId();
            var booking = await _bookingService.ApproveRefundAsync(id, ownerId);
            return Ok(booking);
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
        [HttpGet("verify-stay")]
        public async Task<ActionResult<bool>> VerifyCompletedStay(
    [FromQuery] int bookingId, [FromQuery] int userId, [FromQuery] int hotelId)
        {
            var isVerified = await _bookingService.VerifyCompletedStayAsync(bookingId, userId, hotelId);
            return Ok(new { bookingId, userId, hotelId, isVerified });
        }
    }
}