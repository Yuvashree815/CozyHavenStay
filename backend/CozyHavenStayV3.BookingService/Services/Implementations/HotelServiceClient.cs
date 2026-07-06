using System.Net.Http.Json;
using log4net;
using CozyHavenStayV3.BookingService.DTOs.External;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Services.Implementations
{
    public class HotelServiceClient : IHotelServiceClient
    {
        private readonly HttpClient _httpClient;
        private static readonly ILog Log = LogManager.GetLogger(typeof(HotelServiceClient));

        public HotelServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<FareCalculationResponse> CalculateFareAsync(int roomId, FareCalculationRequest request)
        {
            var response = await _httpClient.PostAsJsonAsync($"api/v1/rooms/{roomId}/calculate-fare", request);

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"HotelService fare calculation failed for room {roomId}. Status: {response.StatusCode}");
                throw new InvalidOperationException("Unable to calculate fare. The room may not exist.");
            }

            var result = await response.Content.ReadFromJsonAsync<FareCalculationResponse>();
            return result ?? throw new InvalidOperationException("HotelService returned an empty fare calculation response.");
        }
        public async Task<bool> IsHotelOwnedByAsync(int hotelId, int ownerId)
        {
            var response = await _httpClient.GetAsync($"api/v1/hotels/{hotelId}/is-owned-by/{ownerId}");

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"HotelService ownership check failed for hotel {hotelId}, owner {ownerId}. Status: {response.StatusCode}");
                return false;
            }

            var result = await response.Content.ReadFromJsonAsync<OwnershipCheckResponse>();
            return result?.IsOwned ?? false;
        }

        public async Task<List<int>> GetOwnedHotelIdsAsync(int ownerId)
        {
            var response = await _httpClient.GetAsync($"api/v1/hotels/owned-by/{ownerId}");

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"HotelService get-owned-hotels failed for owner {ownerId}. Status: {response.StatusCode}");
                return new List<int>();
            }

            var result = await response.Content.ReadFromJsonAsync<List<int>>();
            return result ?? new List<int>();
        }

        

        public async Task<bool> CheckAvailabilityAsync(int roomId, DateTime checkIn, DateTime checkOut)
        {
            var url = $"api/v1/rooms/{roomId}/blocks/availability?checkIn={checkIn:yyyy-MM-dd}&checkOut={checkOut:yyyy-MM-dd}";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"HotelService availability check failed for room {roomId}. Status: {response.StatusCode}");
                throw new InvalidOperationException("Unable to check room availability.");
            }

            var result = await response.Content.ReadFromJsonAsync<AvailabilityResponse>();
            return result?.IsAvailable ?? false;
        }

        public async Task BlockRoomForBookingAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingId)
        {
            var payload = new { CheckIn = checkIn, CheckOut = checkOut, BookingReferenceId = bookingId };
            var response = await _httpClient.PostAsJsonAsync($"api/v1/rooms/{roomId}/blocks/booking", payload);

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"HotelService room block failed for room {roomId}, booking {bookingId}. Status: {response.StatusCode}");
                throw new InvalidOperationException("Unable to reserve the room for the selected dates.");
            }
        }

        public async Task ReleaseBookingBlockAsync(int roomId, int bookingId)
        {
            var response = await _httpClient.DeleteAsync($"api/v1/rooms/{roomId}/blocks/booking/{bookingId}");

            if (!response.IsSuccessStatusCode)
            {
                Log.Warn($"HotelService release block failed for room {roomId}, booking {bookingId}. Status: {response.StatusCode}");
            }
        }
    }
}