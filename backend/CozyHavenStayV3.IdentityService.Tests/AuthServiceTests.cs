using CozyHavenStayV3.IdentityService.DTOs.Auth;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Implementations;
using CozyHavenStayV3.IdentityService.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Moq;
using NUnit.Framework;
using System.Timers;

namespace CozyHavenStayV3.IdentityService.Tests
{
    [TestFixture]
    public class AuthServiceTests
    {
        private Mock<IUserRepository> _userRepositoryMock = null!;
        private Mock<ITokenService> _tokenServiceMock = null!;
        private AuthService _authService = null!;
        private PasswordHasher<User> _passwordHasher = null!;

        [SetUp]
        public void SetUp()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _tokenServiceMock = new Mock<ITokenService>();
            _authService = new AuthService(_userRepositoryMock.Object, _tokenServiceMock.Object);
            _passwordHasher = new PasswordHasher<User>();
        }

        private User CreateTestUser(string email, string plainPassword, bool isActive = true)
        {
            var user = new User
            {
                Id = 1,
                Email = email,
                FullName = "Test User",
                Gender = "Other",
                Address = "Test Address",
                PhoneNumber = "9999999999",
                IsActive = isActive,
                RoleId = 1,
                Role = new Role { Id = 1, Name = "User" }
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, plainPassword);
            return user;
        }

        [Test]
        public async Task LoginAsync_CorrectCredentials_ReturnsTokenAndProfile()
        {
            // Arrange
            var user = CreateTestUser("guest@test.com", "Correct@123");

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync("guest@test.com"))
                .ReturnsAsync(user);

            _tokenServiceMock
                .Setup(t => t.GenerateAccessToken(user))
                .Returns(("fake-jwt-token", DateTime.UtcNow.AddHours(1)));

            var request = new LoginRequestDto { Email = "guest@test.com", Password = "Correct@123" };

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            Assert.That(result.Token, Is.EqualTo("fake-jwt-token"));
            Assert.That(result.Email, Is.EqualTo("guest@test.com"));
            Assert.That(result.Role, Is.EqualTo("User"));
        }

        [Test]
        public void LoginAsync_WrongPassword_ThrowsUnauthorizedWithGenericMessage()
        {
            var user = CreateTestUser("guest@test.com", "Correct@123");

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync("guest@test.com"))
                .ReturnsAsync(user);

            var request = new LoginRequestDto { Email = "guest@test.com", Password = "WrongPassword" };

            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.LoginAsync(request));

            Assert.That(ex!.Message, Is.EqualTo("Invalid email or password."));
        }

        [Test]
        public void LoginAsync_EmailDoesNotExist_ThrowsSameGenericMessageAsWrongPassword()
        {
            // Arrange
            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync("nobody@test.com"))
                .ReturnsAsync((User?)null);

            var request = new LoginRequestDto { Email = "nobody@test.com", Password = "AnyPassword123" };

            // Act + Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.LoginAsync(request));

            
            Assert.That(ex!.Message, Is.EqualTo("Invalid email or password."));
        }

        [Test]
        public void LoginAsync_DeactivatedAccount_ThrowsUnauthorizedWithDeactivatedMessage()
        {
            var user = CreateTestUser("inactive@test.com", "Correct@123", isActive: false);

            _userRepositoryMock
                .Setup(r => r.GetByEmailAsync("inactive@test.com"))
                .ReturnsAsync(user);

            var request = new LoginRequestDto { Email = "inactive@test.com", Password = "Correct@123" };

            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.LoginAsync(request));

            Assert.That(ex!.Message, Does.Contain("deactivated"));
        }

        [Test]
        public async Task LoginAsync_CorrectCredentials_CallsTokenServiceExactlyOnce()
        {
            var user = CreateTestUser("guest@test.com", "Correct@123");

            _userRepositoryMock.Setup(r => r.GetByEmailAsync("guest@test.com")).ReturnsAsync(user);
            _tokenServiceMock
                .Setup(t => t.GenerateAccessToken(user))
                .Returns(("token", DateTime.UtcNow.AddHours(1)));

            var request = new LoginRequestDto { Email = "guest@test.com", Password = "Correct@123" };

            await _authService.LoginAsync(request);

            _tokenServiceMock.Verify(t => t.GenerateAccessToken(user), Times.Once);
        }
    }
}