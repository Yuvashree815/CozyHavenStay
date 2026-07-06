using AutoMapper;
using log4net;
using CozyHavenStayV3.ReviewService.Common;
using CozyHavenStayV3.ReviewService.DTOs;
using CozyHavenStayV3.ReviewService.Models;
using CozyHavenStayV3.ReviewService.Repositories.Interfaces;
using CozyHavenStayV3.ReviewService.Services.Interfaces;

namespace CozyHavenStayV3.ReviewService.Services.Implementations
{
    public class ReviewManagementService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IBookingServiceClient _bookingServiceClient;
        private readonly IMapper _mapper;
        private static readonly ILog Log = LogManager.GetLogger(typeof(ReviewManagementService));

        public ReviewManagementService(
            IReviewRepository reviewRepository,
            IBookingServiceClient bookingServiceClient,
            IMapper mapper)
        {
            _reviewRepository = reviewRepository;
            _bookingServiceClient = bookingServiceClient;
            _mapper = mapper;
        }

        public async Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto dto)
        {
            var alreadyReviewed = await _reviewRepository.ExistsForBookingAsync(dto.BookingId);
            if (alreadyReviewed)
            {
                throw new InvalidOperationException("You have already submitted a review for this booking.");
            }

            var isVerifiedStay = await _bookingServiceClient.VerifyCompletedStayAsync(dto.BookingId, userId, dto.HotelId);
            if (!isVerifiedStay)
            {
                throw new UnauthorizedAccessException("You can only review hotels you have a confirmed booking with.");
            }

            var review = new Review
            {
                UserId = userId,
                HotelId = dto.HotelId,
                BookingId = dto.BookingId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            Log.Info($"Review {review.Id} created by user {userId} for hotel {dto.HotelId}, booking {dto.BookingId}.");

            return _mapper.Map<ReviewDto>(review);
        }

        public async Task<PagedResult<ReviewDto>> GetByHotelIdAsync(int hotelId, int pageNumber, int pageSize)
        {
            var totalCount = await _reviewRepository.CountByHotelIdAsync(hotelId);
            var reviews = await _reviewRepository.GetByHotelIdAsync(hotelId, pageNumber, pageSize);

            return new PagedResult<ReviewDto>
            {
                Items = _mapper.Map<List<ReviewDto>>(reviews),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<HotelRatingSummaryDto> GetRatingSummaryAsync(int hotelId)
        {
            var averageRating = await _reviewRepository.GetAverageRatingAsync(hotelId);
            var totalReviews = await _reviewRepository.CountByHotelIdAsync(hotelId);

            return new HotelRatingSummaryDto
            {
                HotelId = hotelId,
                AverageRating = Math.Round(averageRating, 1),
                TotalReviews = totalReviews
            };
        }
    }
}