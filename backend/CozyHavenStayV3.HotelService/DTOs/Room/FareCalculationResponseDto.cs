namespace CozyHavenStayV3.HotelService.DTOs.Room
{
    public class FareCalculationResponseDto
    {
        public int RoomId { get; set; }
        public decimal BaseFare { get; set; }
        public int NumberOfNights { get; set; }
        public int TotalGuests { get; set; }
        public int FreeOccupancy { get; set; }
        public decimal PerNightSurcharge { get; set; }
        public decimal SurchargeAmount { get; set; }
        public decimal TotalFare { get; set; }
        public bool ExceedsMaxOccupancy { get; set; }
    }
}