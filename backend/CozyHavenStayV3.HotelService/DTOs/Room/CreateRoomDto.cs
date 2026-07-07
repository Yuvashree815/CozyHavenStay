using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.DTOs.Room
{
    public class CreateRoomDto
    {
        public string RoomSize { get; set; } = string.Empty;
        public BedType BedType { get; set; }
        public bool IsAC { get; set; }
        public decimal BaseFare { get; set; }
        public string? ImageUrl { get; set; }
    }
}