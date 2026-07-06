using System.Data;

namespace CozyHavenStayV3.IdentityService.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        
        public string PasswordHash { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        public bool IsActive { get; set; } = true;

        // Navigation property
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}