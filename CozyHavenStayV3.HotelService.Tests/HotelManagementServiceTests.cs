using Moq;
using NUnit.Framework;
using AutoMapper;
using CozyHavenStayV3.HotelService.DTOs.Hotel;
using CozyHavenStayV3.HotelService.Mapping;
using CozyHavenStayV3.HotelService.Models;
using CozyHavenStayV3.HotelService.Repositories.Interfaces;
using CozyHavenStayV3.HotelService.Services.Implementations;

namespace CozyHavenStayV3.HotelService.Tests
{
    [TestFixture]
    public class HotelManagementServiceTests
    {
        private Mock<IHotelRepository> _hotelRepositoryMock = null!;
        private IMapper _mapper = null!;
        private HotelManagementService _hotelService = null!;

        [SetUp]
        public void SetUp()
        {
            _hotelRepositoryMock = new Mock<IHotelRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<HotelMappingProfile>();
            });
            _mapper = config.CreateMapper();

            _hotelService = new HotelManagementService(_hotelRepositoryMock.Object, _mapper);
        }

        [Test]
        public void UpdateHotelAsync_OwnerDoesNotOwnHotel_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var hotel = new Hotel
            {
                Id = 1,
                Name = "Cozy Haven Chennai",
                Location = "Chennai",
                OwnerId = 5,
                IsActive = true
            };

            _hotelRepositoryMock
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(hotel);

            var dto = new UpdateHotelDto
            {
                Name = "Hacked Name",
                Location = "Somewhere Else",
                Description = "Unauthorized edit attempt"
            };

            // Act + Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _hotelService.UpdateHotelAsync(hotelId: 1, ownerId: 99, dto));

            Assert.That(ex!.Message, Is.EqualTo("You do not have permission to edit this hotel."));

           
            _hotelRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Hotel>()), Times.Never);
        }

        [Test]
        public async Task UpdateHotelAsync_OwnerOwnsHotel_UpdatesSuccessfully()
        {
            // Arrange
            var hotel = new Hotel
            {
                Id = 1,
                Name = "Old Name",
                Location = "Old Location",
                OwnerId = 5,
                IsActive = true
            };

            _hotelRepositoryMock
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(hotel);

            var dto = new UpdateHotelDto
            {
                Name = "New Name",
                Location = "New Location",
                Description = "Updated description",
                HasFreeWifi = true
            };

            // Act
            var result = await _hotelService.UpdateHotelAsync(hotelId: 1, ownerId: 5, dto);

            // Assert
            Assert.That(result.Name, Is.EqualTo("New Name"));
            Assert.That(result.HasFreeWifi, Is.True);

           
            _hotelRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Hotel>()), Times.Once);
        }

        [Test]
        public void UpdateHotelAsync_HotelDoesNotExist_ThrowsKeyNotFoundException()
        {
            _hotelRepositoryMock
                .Setup(r => r.GetByIdAsync(404))
                .ReturnsAsync((Hotel?)null);

            var dto = new UpdateHotelDto { Name = "Doesn't Matter", Location = "Nowhere" };

            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _hotelService.UpdateHotelAsync(hotelId: 404, ownerId: 1, dto));
        }

        [Test]
        public async Task IsOwnedByAsync_CorrectOwner_ReturnsTrue()
        {
            var hotel = new Hotel { Id = 1, OwnerId = 5, Name = "Test", Location = "Test" };
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

            var result = await _hotelService.IsOwnedByAsync(1, 5);

            Assert.That(result, Is.True);
        }

        [Test]
        public async Task IsOwnedByAsync_WrongOwner_ReturnsFalse()
        {
            var hotel = new Hotel { Id = 1, OwnerId = 5, Name = "Test", Location = "Test" };
            _hotelRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

            var result = await _hotelService.IsOwnedByAsync(1, 99);

            Assert.That(result, Is.False);
        }
    }
}