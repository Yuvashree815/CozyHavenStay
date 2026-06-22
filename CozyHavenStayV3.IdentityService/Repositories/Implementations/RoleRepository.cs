using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.IdentityService.Data;
using CozyHavenStayV3.IdentityService.Models;
using CozyHavenStayV3.IdentityService.Repositories.Interfaces;

namespace CozyHavenStayV3.IdentityService.Repositories.Implementations
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;

        public RoleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Role?> GetByNameAsync(string name)
        {
            return await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
        }
    }
}