using CozyHavenStayV3.ReviewService.Common;
using CozyHavenStayV3.ReviewService.DTOs;

namespace CozyHavenStayV3.ReviewService.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto dto);
        Task<PagedResult<ReviewDto>> GetByHotelIdAsync(int hotelId, int pageNumber, int pageSize);
        Task<HotelRatingSummaryDto> GetRatingSummaryAsync(int hotelId);
    }
}