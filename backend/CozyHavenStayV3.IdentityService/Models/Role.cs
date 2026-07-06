namespace CozyHavenStayV3.IdentityService.Models
{
    public class Role
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Navigation property
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}