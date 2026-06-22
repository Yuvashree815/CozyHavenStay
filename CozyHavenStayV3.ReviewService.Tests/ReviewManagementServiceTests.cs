using Moq;
using NUnit.Framework;
using AutoMapper;
using CozyHavenStayV3.ReviewService.DTOs;
using CozyHavenStayV3.ReviewService.Mapping;
using CozyHavenStayV3.ReviewService.Models;
using CozyHavenStayV3.ReviewService.Repositories.Interfaces;
using CozyHavenStayV3.ReviewService.Services.Implementations;
using CozyHavenStayV3.ReviewService.Services.Interfaces;

namespace CozyHavenStayV3.ReviewService.Tests
{
    [TestFixture]
    public class ReviewManagementServiceTests
    {
        private Mock<IReviewRepository> _reviewRepositoryMock = null!;
        private Mock<IBookingServiceClient> _bookingServiceClientMock = null!;
        private IMapper _mapper = null!;
        private ReviewManagementService _reviewService = null!;

        [SetUp]
        public void SetUp()
        {
            _reviewRepositoryMock = new Mock<IReviewRepository>();
            _bookingServiceClientMock = new Mock<IBookingServiceClient>();

            var config = new MapperConfiguration(cfg => cfg.AddProfile<ReviewMappingProfile>());
            _mapper = config.CreateMapper();

            _reviewService = new ReviewManagementService(
                _reviewRepositoryMock.Object,
                _bookingServiceClientMock.Object,
                _mapper);
        }

        private CreateReviewDto ValidReviewDto() => new()
        {
            HotelId = 1,
            BookingId = 100,
            Rating = 5,
            Comment = "Wonderful stay, highly recommended."
        };

        [Test]
        public async Task CreateReviewAsync_VerifiedStay_CreatesReviewSuccessfully()
        {
            // Arrange
            _reviewRepositoryMock
                .Setup(r => r.ExistsForBookingAsync(100))
                .ReturnsAsync(false);

            _bookingServiceClientMock
                .Setup(c => c.VerifyCompletedStayAsync(100, 10, 1))
                .ReturnsAsync(true);

            // Act
            var result = await _reviewService.CreateReviewAsync(userId: 10, ValidReviewDto());

            // Assert
            Assert.That(result.Rating, Is.EqualTo(5));
            Assert.That(result.HotelId, Is.EqualTo(1));

            _reviewRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Review>()), Times.Once);
        }

        [Test]
        public void CreateReviewAsync_StayNotVerified_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _reviewRepositoryMock
                .Setup(r => r.ExistsForBookingAsync(100))
                .ReturnsAsync(false);

            _bookingServiceClientMock
                .Setup(c => c.VerifyCompletedStayAsync(100, 10, 1))
                .ReturnsAsync(false);

            // Act + Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _reviewService.CreateReviewAsync(userId: 10, ValidReviewDto()));

            Assert.That(ex!.Message, Is.EqualTo("You can only review hotels you have a confirmed booking with."));

          
            _reviewRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Review>()), Times.Never);
        }

        [Test]
        public void CreateReviewAsync_AlreadyReviewedThisBooking_ThrowsBeforeCallingBookingService()
        {
            // Arrange
            _reviewRepositoryMock
                .Setup(r => r.ExistsForBookingAsync(100))
                .ReturnsAsync(true);

            // Act + Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _reviewService.CreateReviewAsync(userId: 10, ValidReviewDto()));

            Assert.That(ex!.Message, Is.EqualTo("You have already submitted a review for this booking."));

            
            _bookingServiceClientMock.Verify(c => c.VerifyCompletedStayAsync(
                It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Test]
        public async Task GetRatingSummaryAsync_NoReviews_ReturnsZeroAverageNotException()
        {
            // Arrange
            _reviewRepositoryMock.Setup(r => r.GetAverageRatingAsync(5)).ReturnsAsync(0);
            _reviewRepositoryMock.Setup(r => r.CountByHotelIdAsync(5)).ReturnsAsync(0);

            // Act
            var result = await _reviewService.GetRatingSummaryAsync(5);

            // Assert
            Assert.That(result.AverageRating, Is.EqualTo(0));
            Assert.That(result.TotalReviews, Is.EqualTo(0));
        }

        [Test]
        public async Task GetRatingSummaryAsync_MultipleReviews_RoundsAverageToOneDecimalPlace()
        {
            // Arrange
            _reviewRepositoryMock.Setup(r => r.GetAverageRatingAsync(1)).ReturnsAsync(4.3333333);
            _reviewRepositoryMock.Setup(r => r.CountByHotelIdAsync(1)).ReturnsAsync(3);

            // Act
            var result = await _reviewService.GetRatingSummaryAsync(1);

            // Assert
            Assert.That(result.AverageRating, Is.EqualTo(4.3));
            Assert.That(result.TotalReviews, Is.EqualTo(3));
        }
    }
}