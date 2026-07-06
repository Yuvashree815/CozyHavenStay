namespace CozyHavenStayV3.BookingService.DTOs.External
{
    public class FareCalculationResponse
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