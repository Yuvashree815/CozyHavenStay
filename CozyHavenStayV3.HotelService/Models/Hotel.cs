namespace CozyHavenStayV3.HotelService.Models
{
    public class Hotel
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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation property
        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}