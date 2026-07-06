using AutoMapper;
using Microsoft.AspNetCore.Identity;
using log4net;
using CozyHavenStayV3.IdentityService.Common;
using CozyHavenStayV3.IdentityService.DTOs.Account;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService.Services.Implementations
{
    public class AccountService : IAccountService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IMapper _mapper;
        private readonly PasswordHasher<User> _passwordHasher;
        private static readonly ILog Log = LogManager.GetLogger(typeof(AccountService));

        public AccountService(IUserRepository userRepository, IRoleRepository roleRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mapper = mapper;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task RegisterUserAsync(RegisterUserDto dto)
        {
            await EnsureEmailNotTakenAsync(dto.Email);

            var role = await _roleRepository.GetByNameAsync(RoleNames.User)
                ?? throw new InvalidOperationException("User role is not configured in the system.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            await _userRepository.AddAsync(user);
            Log.Info($"New User account registered: {dto.Email} (Id: {user.Id}).");
        }

        public async Task RegisterHotelOwnerAsync(RegisterHotelOwnerDto dto)
        {
            await EnsureEmailNotTakenAsync(dto.Email);

            var role = await _roleRepository.GetByNameAsync(RoleNames.HotelOwner)
                ?? throw new InvalidOperationException("HotelOwner role is not configured in the system.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            await _userRepository.AddAsync(user);
            Log.Info($"New HotelOwner account registered: {dto.Email} (Id: {user.Id}).");
        }

        public async Task RegisterAdminAsync(RegisterAdminDto dto)
        {
            await EnsureEmailNotTakenAsync(dto.Email);

            var role = await _roleRepository.GetByNameAsync(RoleNames.Admin)
                ?? throw new InvalidOperationException("Admin role is not configured in the system.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            await _userRepository.AddAsync(user);
            Log.Info($"New Admin account registered: {dto.Email} (Id: {user.Id}).");
        }

        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Gender = dto.Gender;
            user.Address = dto.Address;
            user.DateOfBirth = dto.DateOfBirth;

            await _userRepository.UpdateAsync(user);

            Log.Info($"Profile updated for user {userId}.");
            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<PagedResult<UserListDto>> GetAllUsersAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _userRepository.GetTotalCountAsync();
            var users = await _userRepository.GetPagedAsync(pageNumber, pageSize);

            var items = _mapper.Map<List<UserListDto>>(users);

            return new PagedResult<UserListDto>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task DeactivateUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            user.IsActive = false;
            await _userRepository.UpdateAsync(user);

            Log.Info($"User {userId} ({user.Email}) deactivated by admin.");
        }

        private async Task EnsureEmailNotTakenAsync(string email)
        {
            var exists = await _userRepository.EmailExistsAsync(email);
            if (exists)
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }
        }
    }
}