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
        // Rules:
        //   - Children ≤5 always free
        //   - Adults fill free slots first (desc age order)
        //   - Extra adults → 40% surcharge
        //   - Extra children (6-14) → 20% surcharge
        // ============================================

        [Test]
        public async Task CalculateFareAsync_TwoAdultsExactlyFillsOccupancy_NoSurcharge()
        {
            // Double bed, free occupancy 2, exactly 2 adults — nobody extra
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
            // Double bed, free occupancy 2
            // Guests: [25, 30, 10]
            // Always free (≤5): none
            // Remaining desc: [30, 25, 10]
            // Free slots: 30 ✓, 25 ✓
            // Extra: 10 (age ≤14) → 20% = ₹700/night
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

            // Child (10) is extra, charged 20% of 3500 = ₹700
            Assert.That(result.PerNightSurcharge, Is.EqualTo(700m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(700m)); // 1 night
            Assert.That(result.TotalFare, Is.EqualTo(4200m)); // 3500 + 700
            Assert.That(result.ExceedsMaxOccupancy, Is.False);
        }

        [Test]
        public async Task CalculateFareAsync_ChildUnderSix_AlwaysFreeReducesAvailableSlots()
        {
            // Double bed, free occupancy 2
            // Guests: [25, 30, 4]
            // Always free (≤5): [4] — consumes 0 free slots (always free separately)
            // Remaining desc: [30, 25]
            // Adjusted free slots: 2 - 1 = 1
            // Free: 30 ✓
            // Extra: 25 → 40% = ₹1,400/night
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

            // Age 4 always free, age 30 fills 1 adjusted free slot, age 25 is extra at 40%
            Assert.That(result.PerNightSurcharge, Is.EqualTo(1400m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(1400m));
            Assert.That(result.TotalFare, Is.EqualTo(4900m));
        }

        [Test]
        public async Task CalculateFareAsync_MultipleNights_SurchargeMultipliedCorrectly()
        {
            // Double bed, 4 nights
            // Guests: [25, 30, 10] — child (10) extra at 20% = ₹700/night
            // Over 4 nights: surcharge = ₹2,800, total = ₹16,800
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
                CheckOut = new DateTime(2026, 12, 5), // 4 nights
                NumberOfAdults = 2,
                NumberOfChildren = 1,
                AllGuestAges = new List<int> { 25, 30, 10 }
            };

            var result = await _roomService.CalculateFareAsync(1, request);

            Assert.That(result.NumberOfNights, Is.EqualTo(4));
            Assert.That(result.PerNightSurcharge, Is.EqualTo(700m));
            Assert.That(result.SurchargeAmount, Is.EqualTo(2800m)); // 700 × 4
            Assert.That(result.TotalFare, Is.EqualTo(16800m)); // (3500+700) × 4
        }

        [Test]
        public async Task CalculateFareAsync_FourGuests_TwoAdultsTwoExtra_BothSurcharged()
        {
            // Double bed, free occupancy 2
            // Guests: [16, 20, 28, 30]
            // Always free (≤5): none
            // Remaining desc: [30, 28, 20, 16]
            // Free: 30 ✓, 28 ✓
            // Extra: 20 → 40% = ₹1,400, 16 → 40% = ₹1,400
            // Total surcharge: ₹2,800/night
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

            Assert.That(result.PerNightSurcharge, Is.EqualTo(2800m)); // 1400 + 1400
            Assert.That(result.TotalFare, Is.EqualTo(6300m)); // 3500 + 2800
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
        // GetAvailableRoomsAsync tests — unchanged
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
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(false);

            var result = await _roomService.GetAvailableRoomsAsync(1, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5));

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

            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(true);
            _roomBlockRepositoryMock
                .Setup(r => r.HasOverlappingBlockAsync(2, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(false);

            var result = await _roomService.GetAvailableRoomsAsync(1, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5));

            Assert.That(result.First(r => r.Id == 1).IsAvailable, Is.False);
            Assert.That(result.First(r => r.Id == 2).IsAvailable, Is.True);
        }

        [Test]
        public void GetAvailableRoomsAsync_HotelDoesNotExist_ThrowsKeyNotFoundException()
        {
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Hotel?)null);

            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _roomService.GetAvailableRoomsAsync(999, new DateTime(2026, 12, 1), new DateTime(2026, 12, 5)));
        }

        [Test]
        public void GetAvailableRoomsAsync_CheckOutBeforeCheckIn_ThrowsArgumentException()
        {
            var hotel = new Hotel { Id = 1, Name = "Test Hotel", Location = "Test", OwnerId = 1 };
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

            Assert.ThrowsAsync<ArgumentException>(async () =>
                await _roomService.GetAvailableRoomsAsync(1, new DateTime(2026, 12, 10), new DateTime(2026, 12, 5)));
        }
    }
}