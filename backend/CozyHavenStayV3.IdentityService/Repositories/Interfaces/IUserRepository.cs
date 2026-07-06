using CozyHavenStayV3.IdentityService.Models;

namespace CozyHavenStayV3.IdentityService.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
        Task<List<User>> GetPagedAsync(int pageNumber, int pageSize);
        Task<int> GetTotalCountAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }
}