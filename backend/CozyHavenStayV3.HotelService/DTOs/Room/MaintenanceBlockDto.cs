namespace CozyHavenStayV3.HotelService.DTOs.Room
{
    public class MaintenanceBlockDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public string Source { get; set; } = string.Empty;
    }

    public class CreateMaintenanceBlockDto
    {
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
    }
}