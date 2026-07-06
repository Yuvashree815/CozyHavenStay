using NUnit.Framework;
using CozyHavenStayV3.ReviewService.DTOs;
using CozyHavenStayV3.ReviewService.Validators;

namespace CozyHavenStayV3.ReviewService.Tests
{
    [TestFixture]
    public class CreateReviewDtoValidatorTests
    {
        private CreateReviewDtoValidator _validator = null!;

        [SetUp]
        public void SetUp()
        {
            _validator = new CreateReviewDtoValidator();
        }

        [Test]
        public async Task Validate_RatingBelowOne_FailsValidation()
        {
            var dto = new CreateReviewDto
            {
                HotelId = 1,
                BookingId = 1,
                Rating = 0, // below minimum
                Comment = "Test comment"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.PropertyName == "Rating"), Is.True);
        }

        [Test]
        public async Task Validate_RatingAboveFive_FailsValidation()
        {
            var dto = new CreateReviewDto
            {
                HotelId = 1,
                BookingId = 1,
                Rating = 6, // above maximum
                Comment = "Test comment"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.PropertyName == "Rating"), Is.True);
        }

        [Test]
        public async Task Validate_ValidRating_PassesValidation()
        {
            var dto = new CreateReviewDto
            {
                HotelId = 1,
                BookingId = 1,
                Rating = 5, // valid
                Comment = "Excellent stay!"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.Errors.Any(e =>
                e.PropertyName == "Rating"), Is.False);
        }
    }
}