namespace CozyHavenStayV3.HotelService.DTOs.Hotel
{
    public class HotelDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public bool HasDining { get; set; }
        public bool HasParking { get; set; }
        public bool HasFreeWifi { get; set; }
        public bool HasRoomService { get; set; }
        public bool HasSwimmingPool { get; set; }
        public bool HasFitnessCenter { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}