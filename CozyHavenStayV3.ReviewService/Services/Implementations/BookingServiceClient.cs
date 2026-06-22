using System.Net.Http.Json;
using log4net;
using CozyHavenStayV3.ReviewService.DTOs.External;
using CozyHavenStayV3.ReviewService.Services.Interfaces;

namespace CozyHavenStayV3.ReviewService.Services.Implementations
{
    public class BookingServiceClient : IBookingServiceClient
    {
        private readonly HttpClient _httpClient;
        private static readonly ILog Log = LogManager.GetLogger(typeof(BookingServiceClient));

        public BookingServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> VerifyCompletedStayAsync(int bookingId, int userId, int hotelId)
        {
            var url = $"api/v1/bookings/verify-stay?bookingId={bookingId}&userId={userId}&hotelId={hotelId}";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"BookingService stay verification failed for booking {bookingId}, user {userId}. Status: {response.StatusCode}");
                return false;
            }

            var result = await response.Content.ReadFromJsonAsync<VerifyStayResponse>();
            return result?.IsVerified ?? false;
        }
    }
}