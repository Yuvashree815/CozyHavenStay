using CozyHavenStayV3.IdentityService.Models;

namespace CozyHavenStayV3.IdentityService.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role?> GetByNameAsync(string name);
    }
}