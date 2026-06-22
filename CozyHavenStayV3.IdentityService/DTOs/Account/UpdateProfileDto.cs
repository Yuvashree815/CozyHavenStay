namespace CozyHavenStayV3.IdentityService.DTOs.Account
{
    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
    }
}