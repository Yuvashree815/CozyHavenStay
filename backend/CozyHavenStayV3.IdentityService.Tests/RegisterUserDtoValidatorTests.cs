using NUnit.Framework;
using CozyHavenStayV3.IdentityService.DTOs.Account;
using CozyHavenStayV3.IdentityService.Validators;

namespace CozyHavenStayV3.IdentityService.Tests
{
    [TestFixture]
    public class RegisterUserDtoValidatorTests
    {
        private RegisterUserDtoValidator _validator = null!;

        [SetUp]
        public void SetUp()
        {
            _validator = new RegisterUserDtoValidator();
        }

        [Test]
        public async Task Validate_InvalidPhoneNumber_FailsValidation()
        {
            var dto = new RegisterUserDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "Test@12345",
                ConfirmPassword = "Test@12345",
                Gender = "Male",
                PhoneNumber = "123", // too short — less than 7 digits
                Address = "Test Address"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("valid number")), Is.True);
        }

        [Test]
        public async Task Validate_PhoneNumberWithLetters_FailsValidation()
        {
            var dto = new RegisterUserDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "Test@12345",
                ConfirmPassword = "Test@12345",
                Gender = "Male",
                PhoneNumber = "abcdefghij", // letters not allowed
                Address = "Test Address"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.IsValid, Is.False);
            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("valid number")), Is.True);
        }

        [Test]
        public async Task Validate_ValidPhoneNumber_PassesValidation()
        {
            var dto = new RegisterUserDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "Test@12345",
                ConfirmPassword = "Test@12345",
                Gender = "Male",
                PhoneNumber = "9876543210", // valid 10 digits
                Address = "Test Address"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("valid number")), Is.False);
        }

        [Test]
        public async Task Validate_PhoneNumberWithPlusPrefix_PassesValidation()
        {
            var dto = new RegisterUserDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "Test@12345",
                ConfirmPassword = "Test@12345",
                Gender = "Male",
                PhoneNumber = "+919876543210", // valid international format
                Address = "Test Address"
            };

            var result = await _validator.ValidateAsync(dto);

            Assert.That(result.Errors.Any(e =>
                e.ErrorMessage.Contains("valid number")), Is.False);
        }
    }
}