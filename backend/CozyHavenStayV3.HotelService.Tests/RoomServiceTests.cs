using Moq;
using NUnit.Framework;
using AutoMapper;
using CozyHavenStayV3.HotelService.DTOs.Room;
using CozyHavenStayV3.HotelService.Mapping;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Implementations;

namespace CozyHavenStayV3.HotelService.Tests
{
    [TestFixture]
    public class RoomServiceTests
    {
        private Mock<IRoomRepository> _roomRepositoryMock = null!;
        private Mock<IHotelRepository> _hotelRepositoryMock = null!;
        private Mock<IRoomBlockRepository> _roomBlockRepositoryMock = null!;
        private IMapper _mapper = null!;
        private RoomService _roomService = null!;

        [SetUp]
        public void SetUp()
        {
            _roomRepositoryMock = new Mock<IRoomRepository>();
            _hotelRepositoryMock = new Mock<IHotelRepository>();
            _roomBlockRepositoryMock = new Mock<IRoomBlockRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<RoomMappingProfile>();
            });
            _mapper = config.CreateMapper();

            _roomService = new RoomService(
                _roomRepositoryMock.Object,
                _hotelRepositoryMock.Object,
                _roomBlockRepositoryMock.Object,
                _mapper);
        }

        // ============================================
        // CalculateFareAsync tests — realistic pricing
        // ============================================

        [Test]
        public async Task CalculateFareAsync_TwoAdultsExactlyFillsOccupancy_NoSurcharge()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 2,
                NumberOfChildren = 0,
                AllGuestAges = new List<int> { 25, 30 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.BaseFare, Is.EqualTo(3500m));
            Assert.That(result.FreeOccupancy, Is.EqualTo(2));
            Assert.That(result.SurchargeAmount, Is.EqualTo(0m));
            Assert.That(result.TotalFare, Is.EqualTo(3500m));
            Assert.That(result.ExceedsMaxOccupancy, Is.False);
        }

        [Test]
        public async Task CalculateFareAsync_ThreeGuests_AdultsGetFreeSlots_ChildPays20Percent()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 2,
                NumberOfChildren = 1,
                AllGuestAges = new List<int> { 25, 30, 10 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.PerNightSurcharge, Is.EqualTo(700m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(700m));
            Assert.That(result.TotalFare, Is.EqualTo(4200m));
            Assert.That(result.ExceedsMaxOccupancy, Is.False);
        }

        [Test]
        public async Task CalculateFareAsync_ChildUnderSix_AlwaysFreeReducesAvailableSlots()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 2,
                NumberOfChildren = 1,
                AllGuestAges = new List<int> { 25, 30, 4 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.PerNightSurcharge, Is.EqualTo(1400m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(1400m));
            Assert.That(result.TotalFare, Is.EqualTo(4900m));
        }

        [Test]
        public async Task CalculateFareAsync_MultipleNights_SurchargeMultipliedCorrectly()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 5),
                NumberOfAdults = 2,
                NumberOfChildren = 1,
                AllGuestAges = new List<int> { 25, 30, 10 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.NumberOfNights, Is.EqualTo(4));
            Assert.That(result.PerNightSurcharge, Is.EqualTo(700m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(2800m));
            Assert.That(result.TotalFare, Is.EqualTo(16800m));
        }

        [Test]
        public async Task CalculateFareAsync_FourGuests_TwoAdultsTwoExtra_BothSurcharged()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 4,
                NumberOfChildren = 0,
                AllGuestAges = new List<int> { 16, 20, 28, 30 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.PerNightSurcharge, Is.EqualTo(2800m));
            Assert.That(result.TotalFare, Is.EqualTo(6300m));
        }

        [Test]
        public async Task CalculateFareAsync_GuestsExceedMaxOccupancy_ReturnsZeroFareAndFlagsExceeded()
        {
            var room = new Room
            {
                Id = 1,
                HotelId = 1,
                BedType = BedType.Double,
                MaxOccupancy = 4,
                BaseFare = 3500m,
                RoomSize = "55 m²",
                IsAC = true,
                IsActive = true
            };
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(room);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 4,
                NumberOfChildren = 1,
                AllGuestAges = new List<int> { 25, 30, 35, 40, 10 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.ExceedsMaxOccupancy, Is.True);
            Assert.That(result.TotalFare, Is.EqualTo(0m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(0m));
        }

        [Test]
        public void CalculateFareAsync_RoomDoesNotExist_ThrowsKeyNotFoundException()
        {
            _roomRepositoryMock.Setup(r => r.GetByIdAsync(999))
                .ReturnsAsync((Room?)null);

            var request = new FareCalculationRequestDto
            {
                CheckIn = new DateTime(2026, 12, 1),
                CheckOut = new DateTime(2026, 12, 2),
                NumberOfAdults = 1,
                NumberOfChildren = 0,
                AllGuestAges = new List<int> { 30 }
            };

            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _roomService.CalculateFareAsync(999, request));
        }

        // ============================================
        // GetAvailableRoomsAsync tests
        // ============================================

        [Test]
        public async Task GetAvailableRoomsAsync_AllRoomsFree_ReturnsAllAsAvailable()
        {
            var hotel = new Hotel { Id = 1, Name = "Test Hotel", Location = "Test", OwnerId = 1 };
            var rooms = new List<Room>
            {
                new() { Id = 1, HotelId = 1, BedType = BedType.Double, MaxOccupancy = 4, BaseFare = 2000m, RoomSize = "40 m²", IsAC = true },
                new() { Id = 2, HotelId = 1, BedType = BedType.Single, MaxOccupancy = 2, BaseFare = 1200m, RoomSize = "25 m²", IsAC = false }
            };

            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);
            _roomRepositoryMock.Setup(r => r.GetByHotelIdAsync(1)).ReturnsAsync(rooms);

            // All rooms return null source → available
            _roomBlockRepositoryMock
                .Setup(r => r.GetOverlappingBlockSourceAsync(
                    It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync((string?)null);

            var result = await _roomService.GetAvailableRoomsAsync(
                1, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5));

            Assert.That(result.Count, Is.EqualTo(2));
            Assert.That(result.All(r => r.IsAvailable), Is.True);
        }

        [Test]
        public async Task GetAvailableRoomsAsync_MixedAvailability_ReturnsCorrectStatusPerRoom()
        {
            var hotel = new Hotel { Id = 1, Name = "Test Hotel", Location = "Test", OwnerId = 1 };
            var rooms = new List<Room>
            {
                new() { Id = 1, HotelId = 1, BedType = BedType.Double, MaxOccupancy = 4, BaseFare = 2000m, RoomSize = "40 m²", IsAC = true },
                new() { Id = 2, HotelId = 1, BedType = BedType.Single, MaxOccupancy = 2, BaseFare = 1200m, RoomSize = "25 m²", IsAC = false }
            };

            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);
            _roomRepositoryMock.Setup(r => r.GetByHotelIdAsync(1)).ReturnsAsync(rooms);

            // Room 1 — blocked (Booking source) → unavailable
            _roomBlockRepositoryMock
                .Setup(r => r.GetOverlappingBlockSourceAsync(
                    1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync("Booking");

            // Room 2 — no block → available
            _roomBlockRepositoryMock
                .Setup(r => r.GetOverlappingBlockSourceAsync(
                    2, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync((string?)null);

            var result = await _roomService.GetAvailableRoomsAsync(
                1, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5));

            Assert.That(result.First(r => r.Id == 1).IsAvailable, Is.False);
            Assert.That(result.First(r => r.Id == 1).UnavailableReason, Is.EqualTo("Booking"));
            Assert.That(result.First(r => r.Id == 2).IsAvailable, Is.True);
            Assert.That(result.First(r => r.Id == 2).UnavailableReason, Is.Null);
        }

        [Test]
        public void GetAvailableRoomsAsync_HotelDoesNotExist_ThrowsKeyNotFoundException()
        {
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Hotel?)null);

            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _roomService.GetAvailableRoomsAsync(
                    999, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5)));
        }

        [Test]
        public void GetAvailableRoomsAsync_CheckOutBeforeCheckIn_ThrowsArgumentException()
        {
            var hotel = new Hotel { Id = 1, Name = "Test Hotel", Location = "Test", OwnerId = 1 };
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

            Assert.ThrowsAsync<ArgumentException>(async () =>
                await _roomService.GetAvailableRoomsAsync(
                    1, new DateTime(2026, 12, 10), new DateTime(2026, 12, 5)));
        }
    }
}