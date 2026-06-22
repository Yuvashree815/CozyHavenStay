using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.ReviewService.Common;
using CozyHavenStayV3.ReviewService.DTOs;
using CozyHavenStayV3.ReviewService.Models;
using CozyHavenStayV3.ReviewService.Services.Interfaces;

namespace CozyHavenStayV3.ReviewService.Controllers
{
    [ApiController]
    [Route("api/v1/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly IValidator<CreateReviewDto> _createValidator;

        public ReviewController(IReviewService reviewService, IValidator<CreateReviewDto> createValidator)
        {
            _reviewService = reviewService;
            _createValidator = createValidator;
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.User)]
        public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto)
        {
            await _createValidator.ValidateAndThrowAsync(dto);
            var userId = GetCurrentUserId();
            var review = await _reviewService.CreateReviewAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, review);
        }

        // Public: anyone browsing a hotel can see its reviews
        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<PagedResult<ReviewDto>>> GetByHotel(
            int hotelId, [FromQuery] PaginationQuery query)
        {
            var result = await _reviewService.GetByHotelIdAsync(hotelId, query.PageNumber, query.PageSize);
            return Ok(result);
        }

        // Public: rating summary shown alongside hotel search results
        [HttpGet("hotel/{hotelId}/summary")]
        public async Task<ActionResult<HotelRatingSummaryDto>> GetRatingSummary(int hotelId)
        {
            var summary = await _reviewService.GetRatingSummaryAsync(hotelId);
            return Ok(summary);
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