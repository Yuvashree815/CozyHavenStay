using Moq;
using NUnit.Framework;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Implementations;

namespace CozyHavenStayV3.HotelService.Tests
{
    [TestFixture]
    public class RoomBlockServiceTests
    {
        private Mock<IRoomBlockRepository> _roomBlockRepositoryMock = null!;
        private Mock<IRoomRepository> _roomRepositoryMock = null!;
        private RoomBlockService _roomBlockService = null!;

        [SetUp]
        public void SetUp()
        {
            _roomBlockRepositoryMock = new Mock<IRoomBlockRepository>();
            _roomRepositoryMock = new Mock<IRoomRepository>();
            _roomBlockService = new RoomBlockService(_roomBlockRepositoryMock.Object, _roomRepositoryMock.Object);
        }

        [Test]
        public async Task IsRoomAvailableAsync_NoOverlap_ReturnsTrue()
        {
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(false);

            var result = await _roomBlockService.IsRoomAvailableAsync(1, new DateTime(2026, 8, 1), new DateTime(2026, 8, 5));

            Assert.That(result, Is.True);
        }

        [Test]
        public async Task IsRoomAvailableAsync_HasOverlap_ReturnsFalse()
        {
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);

            var result = await _roomBlockService.IsRoomAvailableAsync(1, new DateTime(2026, 8, 1), new DateTime(2026, 8, 5));

            Assert.That(result, Is.False);
        }

        [Test]
        public void IsRoomAvailableAsync_CheckOutBeforeCheckIn_ThrowsArgumentException()
        {
            Assert.ThrowsAsync<ArgumentException>(async () =>
                await _roomBlockService.IsRoomAvailableAsync(1, new DateTime(2026, 8, 10), new DateTime(2026, 8, 5)));
        }

        [Test]
        public async Task BlockRoomForBookingAsync_NoOverlap_CreatesBlockSuccessfully()
        {
            var room = new Room { Id = 1, HotelId = 1, BedType = BedType.Double, MaxOccupancy = 4, BaseFare = 3000m, RoomSize = "50 m²" };

            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(false);

            await _roomBlockService.BlockRoomForBookingAsync(1, new DateTime(2026, 9, 1), new DateTime(2026, 9, 5), bookingReferenceId: 42);

            _roomBlockRepositoryMock.Verify(r => r.AddAsync(
                It.Is<RoomBlock>(b => b.RoomId == 1 && b.BookingReferenceId == 42 && b.Source == BlockSource.Booking)),
                Times.Once);
        }

        [Test]
        public void BlockRoomForBookingAsync_HasOverlap_ThrowsInvalidOperationException()
        {
            var room = new Room { Id = 1, HotelId = 1, BedType = BedType.Double, MaxOccupancy = 4, BaseFare = 3000m, RoomSize = "50 m²" };

            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);

            Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _roomBlockService.BlockRoomForBookingAsync(1, new DateTime(2026, 9, 1), new DateTime(2026, 9, 5), bookingReferenceId: 42));

        
            _roomBlockRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RoomBlock>()), Times.Never);
        }

        [Test]
        public void BlockRoomForMaintenanceAsync_WrongOwner_ThrowsUnauthorizedAccessException()
        {
            var hotel = new Hotel { Id = 1, OwnerId = 5, Name = "Test", Location = "Test" };
            var room = new Room { Id = 1, HotelId = 1, Hotel = hotel, BedType = BedType.Double, MaxOccupancy = 4, BaseFare = 3000m, RoomSize = "50 m²" };

            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _roomBlockService.BlockRoomForMaintenanceAsync(1, ownerId: 99, new DateTime(2026, 9, 1), new DateTime(2026, 9, 5)));
        }

        [Test]
        public async Task ReleaseBookingBlockAsync_BlockExists_RemovesIt()
        {
            var block = new RoomBlock { Id = 10, RoomId = 1, BookingReferenceId = 42, Source = BlockSource.Booking };

            _roomBlockRepositoryMock
                .Setup(r => r.GetByBookingReferenceIdAsync(42))
                .ReturnsAsync(block);

            await _roomBlockService.ReleaseBookingBlockAsync(42);

            _roomBlockRepositoryMock.Verify(r => r.RemoveAsync(block), Times.Once);
        }

        [Test]
        public async Task ReleaseBookingBlockAsync_BlockDoesNotExist_DoesNotThrow()
        {
            _roomBlockRepositoryMock
                .Setup(r => r.GetByBookingReferenceIdAsync(999))
                .ReturnsAsync((RoomBlock?)null);

     
            Assert.DoesNotThrowAsync(async () =>
                await _roomBlockService.ReleaseBookingBlockAsync(999));

            _roomBlockRepositoryMock.Verify(r => r.RemoveAsync(It.IsAny<RoomBlock>()), Times.Never);
        }
    }
}