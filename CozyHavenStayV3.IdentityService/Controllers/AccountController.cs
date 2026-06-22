using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CozyHavenStayV3.IdentityService.Common;
using CozyHavenStayV3.IdentityService.DTOs.Account;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService.Controllers
{
    [ApiController]
    [Route("api/v1/account")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IValidator<RegisterUserDto> _registerUserValidator;
        private readonly IValidator<RegisterHotelOwnerDto> _registerHotelOwnerValidator;
        private readonly IValidator<RegisterAdminDto> _registerAdminValidator;
        private readonly IValidator<UpdateProfileDto> _updateProfileValidator;

        public AccountController(
            IAccountService accountService,
            IValidator<RegisterUserDto> registerUserValidator,
            IValidator<RegisterHotelOwnerDto> registerHotelOwnerValidator,
            IValidator<RegisterAdminDto> registerAdminValidator,
            IValidator<UpdateProfileDto> updateProfileValidator)
        {
            _accountService = accountService;
            _registerUserValidator = registerUserValidator;
            _registerHotelOwnerValidator = registerHotelOwnerValidator;
            _registerAdminValidator = registerAdminValidator;
            _updateProfileValidator = updateProfileValidator;
        }

        [HttpPost("register/user")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto dto)             
        {
            await _registerUserValidator.ValidateAndThrowAsync(dto);                              
            await _accountService.RegisterUserAsync(dto);
            return StatusCode(StatusCodes.Status201Created, new { message = "User registered successfully." });
        }

        [HttpPost("register/hotelowner")]
        public async Task<IActionResult> RegisterHotelOwner([FromBody] RegisterHotelOwnerDto dto)
        {
            await _registerHotelOwnerValidator.ValidateAndThrowAsync(dto);
            await _accountService.RegisterHotelOwnerAsync(dto);
            return StatusCode(StatusCodes.Status201Created, new { message = "Hotel owner registered successfully." });
        }

        [HttpPost("register/admin")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto dto)
        {
            await _registerAdminValidator.ValidateAndThrowAsync(dto);
            await _accountService.RegisterAdminAsync(dto);
            return StatusCode(StatusCodes.Status201Created, new { message = "Admin registered successfully." });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var profile = await _accountService.GetProfileAsync(userId);
            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            await _updateProfileValidator.ValidateAndThrowAsync(dto);
            var userId = GetCurrentUserId();
            var updated = await _accountService.UpdateProfileAsync(userId, dto);
            return Ok(updated);
        }

        [HttpGet("users")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<PagedResult<UserListDto>>> GetAllUsers([FromQuery] PaginationQuery query)
        {
            var result = await _accountService.GetAllUsersAsync(query.PageNumber, query.PageSize);
            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            await _accountService.DeactivateUserAsync(id);
            return NoContent();
        }

        private int GetCurrentUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (sub is null || !int.TryParse(sub, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user identity in token.");
            }
            return userId;
        }
    }
}