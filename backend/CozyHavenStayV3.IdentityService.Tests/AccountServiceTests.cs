using Moq;
using NUnit.Framework;
using AutoMapper;
using CozyHavenStayV3.IdentityService.DTOs.Account;
using CozyHavenStayV3.IdentityService.Mapping;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Implementations;

namespace CozyHavenStayV3.IdentityService.Tests
{
    [TestFixture]
    public class AccountServiceTests
    {
        private Mock<IUserRepository> _userRepositoryMock = null!;
        private Mock<IRoleRepository> _roleRepositoryMock = null!;
        private IMapper _mapper = null!;
        private AccountService _accountService = null!;

        [SetUp]
        public void SetUp()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _roleRepositoryMock = new Mock<IRoleRepository>();

            var config = new MapperConfiguration(cfg => cfg.AddProfile<UserMappingProfile>());
            _mapper = config.CreateMapper();

            _accountService = new AccountService(_userRepositoryMock.Object, _roleRepositoryMock.Object, _mapper);
        }

        [Test]
        public async Task RegisterUserAsync_NewEmail_CreatesUserWithUserRoleAndHashedPassword()
        {
            // Arrange
            _userRepositoryMock
                .Setup(r => r.EmailExistsAsync("newguest@test.com"))
                .ReturnsAsync(false);

            _roleRepositoryMock
                .Setup(r => r.GetByNameAsync(RoleNames.User))
                .ReturnsAsync(new Role { Id = 1, Name = RoleNames.User });

            User? capturedUser = null;
            _userRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);

            var dto = new RegisterUserDto
            {
                FullName = "New Guest",
                Email = "newguest@test.com",
                Password = "Plain@Password123",
                ConfirmPassword = "Plain@Password123",
                Gender = "Female",
                PhoneNumber = "9876543210",
                Address = "123 Test St"
            };

            // Act
            await _accountService.RegisterUserAsync(dto);

            // Assert
            Assert.That(capturedUser, Is.Not.Null);
            Assert.That(capturedUser!.RoleId, Is.EqualTo(1));
            Assert.That(capturedUser.Email, Is.EqualTo("newguest@test.com"));

            
            Assert.That(capturedUser.PasswordHash, Is.Not.EqualTo("Plain@Password123"));
            Assert.That(capturedUser.PasswordHash, Is.Not.Empty);
        }

        [Test]
        public void RegisterUserAsync_EmailAlreadyExists_ThrowsInvalidOperationException()
        {
            _userRepositoryMock
                .Setup(r => r.EmailExistsAsync("taken@test.com"))
                .ReturnsAsync(true);

            var dto = new RegisterUserDto
            {
                FullName = "Someone",
                Email = "taken@test.com",
                Password = "Plain@Password123",
                ConfirmPassword = "Plain@Password123",
                Gender = "Male",
                PhoneNumber = "9876543210",
                Address = "Test"
            };

            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _accountService.RegisterUserAsync(dto));

            Assert.That(ex!.Message, Is.EqualTo("An account with this email already exists."));

            
            _userRepositoryMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
        }

        [Test]
        public async Task RegisterHotelOwnerAsync_NewEmail_AssignsHotelOwnerRole()
        {
            _userRepositoryMock.Setup(r => r.EmailExistsAsync("owner@test.com")).ReturnsAsync(false);
            _roleRepositoryMock
                .Setup(r => r.GetByNameAsync(RoleNames.HotelOwner))
                .ReturnsAsync(new Role { Id = 2, Name = RoleNames.HotelOwner });

            User? capturedUser = null;
            _userRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);

            var dto = new RegisterHotelOwnerDto
            {
                FullName = "Hotel Owner",
                Email = "owner@test.com",
                Password = "Plain@Password123",
                ConfirmPassword = "Plain@Password123",
                Gender = "Male",
                PhoneNumber = "9876543210",
                Address = "Test"
            };

            await _accountService.RegisterHotelOwnerAsync(dto);

            Assert.That(capturedUser!.RoleId, Is.EqualTo(2));
        }

        [Test]
        public void DeactivateUserAsync_UserNotFound_ThrowsKeyNotFoundException()
        {
            _userRepositoryMock
                .Setup(r => r.GetByIdAsync(999))
                .ReturnsAsync((User?)null);

            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _accountService.DeactivateUserAsync(999));
        }

        [Test]
        public async Task DeactivateUserAsync_UserExists_SetsIsActiveFalse()
        {
            var user = new User
            {
                Id = 1,
                Email = "test@test.com",
                FullName = "Test",
                Gender = "Other",
                Address = "Test",
                PhoneNumber = "9999999999",
                IsActive = true,
                RoleId = 1
            };

            _userRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

            await _accountService.DeactivateUserAsync(1);

            Assert.That(user.IsActive, Is.False);
            _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.IsActive == false)), Times.Once);
        }
    }
}