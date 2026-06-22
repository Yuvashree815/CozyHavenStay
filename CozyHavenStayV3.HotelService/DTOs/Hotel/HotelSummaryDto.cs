namespace CozyHavenStayV3.HotelService.DTOs.Hotel
{
    public class HotelSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool HasDining { get; set; }
        public bool HasParking { get; set; }
        public bool HasFreeWifi { get; set; }
        public bool HasRoomService { get; set; }
        public bool HasSwimmingPool { get; set; }
        public bool HasFitnessCenter { get; set; }
    }
}