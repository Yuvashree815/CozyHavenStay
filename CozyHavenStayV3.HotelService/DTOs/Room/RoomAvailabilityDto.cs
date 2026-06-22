using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.DTOs.Room
{
    public class RoomAvailabilityDto
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string RoomSize { get; set; } = string.Empty;
        public BedType BedType { get; set; }
        public int MaxOccupancy { get; set; }
        public bool IsAC { get; set; }
        public decimal BaseFare { get; set; }
        public bool IsAvailable { get; set; }
    }
}