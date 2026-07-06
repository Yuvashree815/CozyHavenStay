namespace CozyHavenStayV3.HotelService.Models
{
    public enum BlockSource
    {
        Booking,
        Maintenance
    }

    public class RoomBlock
    {
        public int Id { get; set; }

        public int RoomId { get; set; }
        public Room Room { get; set; } = null!;

        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }

        public BlockSource Source { get; set; }


        public int? BookingReferenceId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}