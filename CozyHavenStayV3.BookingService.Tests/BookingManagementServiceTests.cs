using Moq;
using NUnit.Framework;
using AutoMapper;
using CozyHavenStayV3.BookingService.DTOs;
using CozyHavenStayV3.BookingService.DTOs.External;
using CozyHavenStayV3.BookingService.Mapping;
using CozyHavenStayV3.BookingService.Models;
using CozyHavenStayV3.BookingService.Repositories.Interfaces;
using CozyHavenStayV3.BookingService.Services.Implementations;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Tests
{
    [TestFixture]
    public class BookingManagementServiceTests
    {
        private Mock<IBookingRepository> _bookingRepositoryMock = null!;
        private Mock<IPaymentService> _paymentServiceMock = null!;
        private Mock<IHotelServiceClient> _hotelServiceClientMock = null!;
        private IMapper _mapper = null!;
        private BookingManagementService _bookingService = null!;

        [SetUp]
        public void SetUp()
        {
            _bookingRepositoryMock = new Mock<IBookingRepository>();
            _paymentServiceMock = new Mock<IPaymentService>();
            _hotelServiceClientMock = new Mock<IHotelServiceClient>();

            var config = new MapperConfiguration(cfg => cfg.AddProfile<BookingMappingProfile>());
            _mapper = config.CreateMapper();

            _bookingService = new BookingManagementService(
                _bookingRepositoryMock.Object,
                _paymentServiceMock.Object,
                _hotelServiceClientMock.Object,
                _mapper);
        }

        private CreateBookingDto ValidBookingDto() => new()
        {
            HotelId = 1,
            RoomId = 1,
            CheckIn = new DateTime(2026, 9, 1),
            CheckOut = new DateTime(2026, 9, 5),
            NumberOfAdults = 2,
            NumberOfChildren = 0,
            GuestAges = new List<int> { 30, 28 },
            PaymentMethod = PaymentMethodDto.UPI
        };

        [Test]
        public async Task CreateBookingAsync_HappyPath_ConfirmsBookingAndBlocksRoom()
        {
            // Arrange
            _hotelServiceClientMock
                .Setup(c => c.CheckAvailabilityAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);

            _hotelServiceClientMock
                .Setup(c => c.CalculateFareAsync(1, It.IsAny<FareCalculationRequest>()))
                .ReturnsAsync(new FareCalculationResponse
                {
                    RoomId = 1,
                    BaseFare = 3000m,
                    TotalGuests = 2,
                    FreeOccupancy = 2,
                    SurchargeAmount = 0m,
                    TotalFare = 3000m,
                    ExceedsMaxOccupancy = false
                });

            _paymentServiceMock
                .Setup(p => p.ProcessPaymentAsync(It.IsAny<int>(), 3000m, PaymentMethod.UPI))
                .ReturnsAsync(new Payment { Id = 1, BookingId = 1, Amount = 3000m, Status = PaymentStatus.Completed });

            _bookingRepositoryMock
                .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
                .ReturnsAsync(new Booking
                {
                    Id = 1,
                    UserId = 10,
                    HotelId = 1,
                    RoomId = 1,
                    Status = BookingStatus.Confirmed,
                    TotalFare = 3000m,
                    Guests = new List<BookingGuest>(),
                    Payment = new Payment { Status = PaymentStatus.Completed }
                });

            // Act
            var result = await _bookingService.CreateBookingAsync(10, ValidBookingDto());

            // Assert
            Assert.That(result.Status, Is.EqualTo(BookingStatus.Confirmed));

            
            _hotelServiceClientMock.Verify(c => c.BlockRoomForBookingAsync(
                1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<int>()), Times.Once);

            
            _bookingRepositoryMock.Verify(r => r.UpdateAsync(
                It.Is<Booking>(b => b.Status == BookingStatus.Confirmed)), Times.AtLeastOnce);
        }

        [Test]
        public void CreateBookingAsync_RoomNotAvailable_ThrowsAndNeverChargesPayment()
        {
            // Arrange
            _hotelServiceClientMock
                .Setup(c => c.CheckAvailabilityAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(false);

            // Act + Assert
            Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _bookingService.CreateBookingAsync(10, ValidBookingDto()));

            
            _paymentServiceMock.Verify(p => p.ProcessPaymentAsync(
                It.IsAny<int>(), It.IsAny<decimal>(), It.IsAny<PaymentMethod>()), Times.Never);
        }

        [Test]
        public void CreateBookingAsync_ExceedsMaxOccupancy_ThrowsBeforePayment()
        {
            _hotelServiceClientMock
                .Setup(c => c.CheckAvailabilityAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);

            _hotelServiceClientMock
                .Setup(c => c.CalculateFareAsync(1, It.IsAny<FareCalculationRequest>()))
                .ReturnsAsync(new FareCalculationResponse { ExceedsMaxOccupancy = true, TotalFare = 0m });

            Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _bookingService.CreateBookingAsync(10, ValidBookingDto()));

            _paymentServiceMock.Verify(p => p.ProcessPaymentAsync(
                It.IsAny<int>(), It.IsAny<decimal>(), It.IsAny<PaymentMethod>()), Times.Never);
        }

        [Test]
        public async Task CreateBookingAsync_RoomBlockFailsAfterPayment_RollsBackToCancelledAndRefundPending()
        {
            // Arrange
            _hotelServiceClientMock
                .Setup(c => c.CheckAvailabilityAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);

            _hotelServiceClientMock
                .Setup(c => c.CalculateFareAsync(1, It.IsAny<FareCalculationRequest>()))
                .ReturnsAsync(new FareCalculationResponse
                {
                    RoomId = 1,
                    BaseFare = 3000m,
                    TotalFare = 3000m,
                    ExceedsMaxOccupancy = false
                });

            var processedPayment = new Payment { Id = 1, BookingId = 1, Amount = 3000m, Status = PaymentStatus.Completed };
            _paymentServiceMock
                .Setup(p => p.ProcessPaymentAsync(It.IsAny<int>(), 3000m, PaymentMethod.UPI))
                .ReturnsAsync(processedPayment);

          
            _hotelServiceClientMock
                .Setup(c => c.BlockRoomForBookingAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<int>()))
                .ThrowsAsync(new InvalidOperationException("HotelService unreachable"));

            // Act + Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _bookingService.CreateBookingAsync(10, ValidBookingDto()));

            Assert.That(ex!.Message, Is.EqualTo("Unable to confirm your room. Your payment will be refunded."));

            
            _bookingRepositoryMock.Verify(r => r.UpdateAsync(
                It.Is<Booking>(b => b.Status == BookingStatus.Cancelled)), Times.Once);

            
            _paymentServiceMock.Verify(p => p.MarkRefundPendingAsync(processedPayment), Times.Once);
        }

        [Test]
        public void CancelBookingAsync_NotOwnedByUser_ThrowsUnauthorizedAccessException()
        {
            var booking = new Booking
            {
                Id = 1,
                UserId = 5,
                HotelId = 1,
                RoomId = 1,
                Status = BookingStatus.Confirmed,
                Payment = new Payment { Status = PaymentStatus.Completed }
            };

            _bookingRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(booking);

            
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _bookingService.CancelBookingAsync(1, userId: 99));

            _hotelServiceClientMock.Verify(c => c.ReleaseBookingBlockAsync(
                It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Test]
        public async Task CancelBookingAsync_ValidOwner_ReleasesRoomBlockAndMarksRefundPending()
        {
            var payment = new Payment { Status = PaymentStatus.Completed };
            var booking = new Booking
            {
                Id = 1,
                UserId = 5,
                HotelId = 1,
                RoomId = 1,
                Status = BookingStatus.Confirmed,
                Payment = payment
            };

            _bookingRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(booking);

            await _bookingService.CancelBookingAsync(1, userId: 5);

            Assert.That(booking.Status, Is.EqualTo(BookingStatus.Cancelled));
            _paymentServiceMock.Verify(p => p.MarkRefundPendingAsync(payment), Times.Once);
            _hotelServiceClientMock.Verify(c => c.ReleaseBookingBlockAsync(1, 1), Times.Once);
        }

        [Test]
        public void CancelBookingAsync_AlreadyCancelled_ThrowsInvalidOperationException()
        {
            var booking = new Booking
            {
                Id = 1,
                UserId = 5,
                HotelId = 1,
                RoomId = 1,
                Status = BookingStatus.Cancelled,
                Payment = new Payment()
            };

            _bookingRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(booking);

            Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _bookingService.CancelBookingAsync(1, userId: 5));
        }

        [Test]
        public void ApproveRefundAsync_OwnerDoesNotOwnHotel_ThrowsUnauthorizedAccessException()
        {
            var booking = new Booking
            {
                Id = 1,
                UserId = 5,
                HotelId = 1,
                RoomId = 1,
                Status = BookingStatus.Cancelled,
                Payment = new Payment { Status = PaymentStatus.RefundPending }
            };

            _bookingRepositoryMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(booking);
            _hotelServiceClientMock.Setup(c => c.IsHotelOwnedByAsync(1, 99)).ReturnsAsync(false);

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _bookingService.ApproveRefundAsync(1, ownerId: 99));

            _paymentServiceMock.Verify(p => p.ApproveRefundAsync(It.IsAny<int>()), Times.Never);
        }
    }
}