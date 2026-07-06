using NUnit.Framework;
using CozyHavenStayV3.BookingService.DTOs;
using CozyHavenStayV3.BookingService.Validators;

namespace CozyHavenStayV3.BookingService.Tests
{
    [TestFixture]
    public class CreateBookingDtoValidatorTests
    {
        private CreateBookingDtoValidator _validator = null!;

        [SetUp]
        public void SetUp()
        {
            _validator = new CreateBookingDtoValidator();
        }

        [Test]
        public async Task Validate_PastCheckInDate_FailsValidation()
        {
            var dto = new CreateBookingDto
            {
                HotelId = 1,
                RoomId = 1,
                CheckIn = DateTime.UtcNow.AddDays(-1), // yesterday
                CheckOut = DateTime.UtcNow.AddDays(1),
                NumberOfAdults = 1,
                NumberOfChildren = 0,
                GuestAges = new List<int> { 25 },
                PaymentMethod = PaymentMethodDto.UPI
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("cannot be in the past")), Is.True);
        }

        [Test]
        public async Task Validate_CheckOutSameDayAsCheckIn_FailsValidation()
        {
            var dto = new CreateBookingDto
            {
                HotelId = 1,
                RoomId = 1,
                CheckIn = DateTime.UtcNow.AddDays(5),
                CheckOut = DateTime.UtcNow.AddDays(5), // same day — 0 nights
                NumberOfAdults = 1,
                NumberOfChildren = 0,
                GuestAges = new List<int> { 25 },
                PaymentMethod = PaymentMethodDto.UPI
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("minimum 1 night")), Is.True);
        }

        [Test]
        public async Task Validate_StayExceeds30Nights_FailsValidation()
        {
            var dto = new CreateBookingDto
            {
                HotelId = 1,
                RoomId = 1,
                CheckIn = DateTime.UtcNow.AddDays(5),
                CheckOut = DateTime.UtcNow.AddDays(36), // 31 nights
                NumberOfAdults = 1,
                NumberOfChildren = 0,
                GuestAges = new List<int> { 25 },
                PaymentMethod = PaymentMethodDto.UPI
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("30 nights")), Is.True);
        }

        [Test]
        public async Task Validate_ValidBooking_PassesValidation()
        {
            var dto = new CreateBookingDto
            {
                HotelId = 1,
                RoomId = 1,
                CheckIn = DateTime.UtcNow.AddDays(5),
                CheckOut = DateTime.UtcNow.AddDays(7), // 2 nights — valid
                NumberOfAdults = 2,
                NumberOfChildren = 0,
                GuestAges = new List<int> { 25, 30 },
                PaymentMethod = PaymentMethodDto.UPI
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.True);
        }
    }
}