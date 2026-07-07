namespace CozyHavenStayV3.HotelService.Models
{
    public class Room
    {
        public int Id { get; set; }

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;

        public string RoomSize { get; set; } = string.Empty;

        public BedType BedType { get; set; }

        
        public int MaxOccupancy { get; set; }

        public bool IsAC { get; set; }

        public decimal BaseFare { get; set; }

        public bool IsActive { get; set; } = true;
        public string? ImageUrl { get; set; }

        // Navigation property
        public ICollection<RoomBlock> RoomBlocks { get; set; } = new List<RoomBlock>();
    }
}