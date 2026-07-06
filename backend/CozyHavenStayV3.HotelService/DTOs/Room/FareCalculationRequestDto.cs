namespace CozyHavenStayV3.HotelService.DTOs.Room
{
    public class FareCalculationRequestDto
    {
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfAdults { get; set; }
        public int NumberOfChildren { get; set; }
        public List<int> AllGuestAges { get; set; } = new();
    }
}