using System.Text;
using Newtonsoft.Json;

class Program
{
    private static readonly HttpClientHandler _handler = new()
    {
        ServerCertificateCustomValidationCallback = (_, _, _, _) => true
    };
    private static readonly HttpClient _client = new(_handler)
    {
        BaseAddress = new Uri("https://localhost:7100"),
        Timeout = TimeSpan.FromSeconds(30)
    };

    private static string _ananyaToken = "";
    private static string _rohanToken = "";
    private static string _meeraToken = "";
    private static string _karthikToken = "";
    private static string _divyaToken = "";

    // Hotel IDs
    private const int GrandChennai = 7;
    private const int MarinaChennai = 8;
    private const int RoyalMumbai = 10;
    private const int SeaviewMumbai = 11;
    private const int SiliconBangalore = 13;
    private const int GardenBangalore = 14;
    private const int HeritageDelhiId = 16;
    private const int CapitalDelhiId = 17;
    private const int SeaGoa = 19;
    private const int PalmGoa = 20;
    private const int NizamiHyd = 22;
    private const int CyberHyd = 23;

    // Room IDs
    private const int GrandChennaiSingle = 8;
    private const int GrandChennaiKing = 10;
    private const int RoyalMumbaiSingle = 17;
    private const int RoyalMumbaiDouble = 18;
    private const int SeaGoaSingle = 44;
    private const int SeaGoaKing = 46;
    private const int NizamiHydSingle = 53;
    private const int NizamiHydKing = 55;
    private const int GardenBangaloreSingle = 29;
    private const int GardenBangaloreKing = 31;
    private const int PalmGoaDouble = 48;
    private const int PalmGoaSingle = 47;
    private const int MarinaChennaiDouble = 12;
    private const int SeaviewMumbaiDouble = 21;
    private const int CapitalDelhiDouble = 39;
    private const int CyberHydDouble = 57;

    static async Task Main()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("╔══════════════════════════════════════════╗");
        Console.WriteLine("║   CozyHavenStay — Extra Reviews Seeder   ║");
        Console.WriteLine("╚══════════════════════════════════════════╝");
        Console.ResetColor();
        Console.WriteLine();

        try
        {
            await Step("1. Logging in guests", LoginGuests);
            await Step("2. Creating extra bookings", SeedExtraBookings);
            await Step("3. Creating extra reviews", SeedExtraReviews);

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine();
            Console.WriteLine("╔══════════════════════════════════════════╗");
            Console.WriteLine("║   ✅ Done! Extra reviews added           ║");
            Console.WriteLine("╚══════════════════════════════════════════╝");
            Console.ResetColor();
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\n❌ Failed: {ex.Message}");
            Console.ResetColor();
        }
    }

    static async Task Step(string name, Func<Task> action)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write($"  → {name}... ");
        Console.ResetColor();
        await action();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("✓");
        Console.ResetColor();
    }

    static async Task LoginGuests()
    {
        _ananyaToken = await Login("ananya@gmail.com", "CozyGuest@123");
        _rohanToken = await Login("rohan@gmail.com", "CozyGuest@123");
        _meeraToken = await Login("meera@gmail.com", "CozyGuest@123");
        _karthikToken = await Login("karthik@gmail.com", "CozyGuest@123");
        _divyaToken = await Login("divya@gmail.com", "CozyGuest@123");
    }

    static async Task SeedExtraBookings()
    {
        // Extra bookings for Grand Chennai
        await CreateBooking(_rohanToken, new
        {
            hotelId = GrandChennai,
            roomId = GrandChennaiSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 32 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_meeraToken, new
        {
            hotelId = GrandChennai,
            roomId = GrandChennaiKing,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-47).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 26, 27 },
            paymentMethod = "CreditCard"
        });

        await CreateBooking(_karthikToken, new
        {
            hotelId = GrandChennai,
            roomId = GrandChennaiSingle,
            checkIn = DateTime.UtcNow.AddDays(-55).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-53).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 25 },
            paymentMethod = "NetBanking"
        });

        // Extra bookings for Royal Palms Mumbai
        await CreateBooking(_ananyaToken, new
        {
            hotelId = RoyalMumbai,
            roomId = RoyalMumbaiSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 28 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_meeraToken, new
        {
            hotelId = RoyalMumbai,
            roomId = RoyalMumbaiDouble,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-48).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 26, 27 },
            paymentMethod = "DebitCard"
        });

        await CreateBooking(_divyaToken, new
        {
            hotelId = RoyalMumbai,
            roomId = RoyalMumbaiSingle,
            checkIn = DateTime.UtcNow.AddDays(-60).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-58).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 31 },
            paymentMethod = "UPI"
        });

        // Extra bookings for Sea Breeze Goa
        await CreateBooking(_ananyaToken, new
        {
            hotelId = SeaGoa,
            roomId = SeaGoaSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 28 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_karthikToken, new
        {
            hotelId = SeaGoa,
            roomId = SeaGoaKing,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-46).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 25, 27 },
            paymentMethod = "CreditCard"
        });

        await CreateBooking(_divyaToken, new
        {
            hotelId = SeaGoa,
            roomId = SeaGoaSingle,
            checkIn = DateTime.UtcNow.AddDays(-55).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-53).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 31 },
            paymentMethod = "UPI"
        });

        // Extra bookings for Nizami Grand Hyderabad
        await CreateBooking(_ananyaToken, new
        {
            hotelId = NizamiHyd,
            roomId = NizamiHydSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 28 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_rohanToken, new
        {
            hotelId = NizamiHyd,
            roomId = NizamiHydKing,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-48).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 32, 29 },
            paymentMethod = "CreditCard"
        });

        // Extra bookings for Garden View Bangalore
        await CreateBooking(_ananyaToken, new
        {
            hotelId = GardenBangalore,
            roomId = GardenBangaloreSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 28 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_karthikToken, new
        {
            hotelId = GardenBangalore,
            roomId = GardenBangaloreKing,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-47).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 25, 27 },
            paymentMethod = "NetBanking"
        });

        // Extra bookings for Palm Grove Goa
        await CreateBooking(_ananyaToken, new
        {
            hotelId = PalmGoa,
            roomId = PalmGoaSingle,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-42).ToString("yyyy-MM-dd"),
            numberOfAdults = 1,
            numberOfChildren = 0,
            guestAges = new[] { 28 },
            paymentMethod = "UPI"
        });

        await CreateBooking(_karthikToken, new
        {
            hotelId = PalmGoa,
            roomId = PalmGoaDouble,
            checkIn = DateTime.UtcNow.AddDays(-50).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-47).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 25, 27 },
            paymentMethod = "CreditCard"
        });

        // Extra bookings for Marina Bay Suites
        await CreateBooking(_karthikToken, new
        {
            hotelId = MarinaChennai,
            roomId = MarinaChennaiDouble,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 25, 27 },
            paymentMethod = "UPI"
        });

        // Extra bookings for Capital Comfort Delhi
        await CreateBooking(_rohanToken, new
        {
            hotelId = CapitalDelhiId,
            roomId = CapitalDelhiDouble,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 32, 29 },
            paymentMethod = "CreditCard"
        });

        // Extra bookings for Cyber City Suites
        await CreateBooking(_meeraToken, new
        {
            hotelId = CyberHyd,
            roomId = CyberHydDouble,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 26, 27 },
            paymentMethod = "UPI"
        });

        // Extra bookings for Seaview Residency
        await CreateBooking(_ananyaToken, new
        {
            hotelId = SeaviewMumbai,
            roomId = SeaviewMumbaiDouble,
            checkIn = DateTime.UtcNow.AddDays(-45).ToString("yyyy-MM-dd"),
            checkOut = DateTime.UtcNow.AddDays(-43).ToString("yyyy-MM-dd"),
            numberOfAdults = 2,
            numberOfChildren = 0,
            guestAges = new[] { 28, 30 },
            paymentMethod = "UPI"
        });
    }

    static async Task SeedExtraReviews()
    {
        // Grand Chennai — 3 more reviews
        var b1 = await GetBookingId(_rohanToken, GrandChennai);
        var b2 = await GetBookingId(_meeraToken, GrandChennai);
        var b3 = await GetBookingId(_karthikToken, GrandChennai);

        await CreateReview(_rohanToken, GrandChennai, b1, 5,
            "Outstanding experience! The Grand Chennai sets the gold standard for luxury hospitality. The rooftop pool at sunset is unforgettable. Every staff member was attentive and genuinely helpful.");

        await CreateReview(_meeraToken, GrandChennai, b2, 4,
            "Beautiful hotel with world-class amenities. The King suite was incredibly spacious and the bed was the most comfortable I have ever slept in. Dining options are excellent. Slight wait at check-in but overall fantastic.");

        await CreateReview(_karthikToken, GrandChennai, b3, 5,
            "This is Chennai's finest! From the moment you walk in, the service is impeccable. The gym is fully equipped, the pool is pristine and the food is absolutely delicious. Worth every rupee!");

        // Royal Palms Mumbai — 3 more reviews
        var b4 = await GetBookingId(_ananyaToken, RoyalMumbai);
        var b5 = await GetBookingId(_meeraToken, RoyalMumbai);
        var b6 = await GetBookingId(_divyaToken, RoyalMumbai);

        await CreateReview(_ananyaToken, RoyalMumbai, b4, 5,
            "Royal Palms is simply magnificent! The view of the Arabian Sea from our room was breathtaking. The breakfast buffet had over 50 items and everything was fresh. A truly royal experience in Mumbai!");

        await CreateReview(_meeraToken, RoyalMumbai, b5, 4,
            "Absolutely loved our stay! The location is perfect and the pool is stunning. Room service was quick and the food quality was excellent. The spa treatments are a must-try. Will definitely return!");

        await CreateReview(_divyaToken, RoyalMumbai, b6, 5,
            "The best hotel in Mumbai without question! Everything from the lobby to the rooms to the dining is top-tier. The concierge arranged a private city tour for us. Exceptional service throughout.");

        // Sea Breeze Goa — 3 more reviews
        var b7 = await GetBookingId(_ananyaToken, SeaGoa);
        var b8 = await GetBookingId(_karthikToken, SeaGoa);
        var b9 = await GetBookingId(_divyaToken, SeaGoa);

        await CreateReview(_ananyaToken, SeaGoa, b7, 5,
            "Sea Breeze Goa is paradise! Woke up to stunning ocean views every morning. The pool area is gorgeous and the staff are so friendly and helpful. Best Goa hotel I have stayed at in years!");

        await CreateReview(_karthikToken, SeaGoa, b8, 4,
            "Wonderful beachside retreat! The King room was spacious with a beautiful sea view balcony. Loved the evening sunsets from the pool area. Food was fresh and tasty. Highly recommend for couples!");

        await CreateReview(_divyaToken, SeaGoa, b9, 5,
            "Simply perfect Goa experience! The location is unbeatable — right by the beach. Staff arranged water sports and a sunset cruise for us. The rooms are clean, modern and beautifully designed.");

        // Nizami Grand Hyderabad — 2 more reviews
        var b10 = await GetBookingId(_ananyaToken, NizamiHyd);
        var b11 = await GetBookingId(_rohanToken, NizamiHyd);

        await CreateReview(_ananyaToken, NizamiHyd, b10, 5,
            "The Nizami Grand is a masterpiece! The architecture is stunning and every detail reflects the rich Hyderabadi heritage. The pool is beautiful and the biryani at their restaurant is legendary. Must visit!");

        await CreateReview(_rohanToken, NizamiHyd, b11, 4,
            "Exceptional hotel with superb amenities. The King suite had a private jacuzzi which was a wonderful surprise. Dining is excellent — try the haleem! Service could be slightly faster at peak hours but overall outstanding.");

        // Garden View Suites Bangalore — 2 more reviews
        var b12 = await GetBookingId(_ananyaToken, GardenBangalore);
        var b13 = await GetBookingId(_karthikToken, GardenBangalore);

        await CreateReview(_ananyaToken, GardenBangalore, b12, 5,
            "Garden View Suites is a green oasis in Bangalore! The lush gardens are so calming and the pool area is gorgeous. Perfect escape from the city. Breakfast in the garden was a truly lovely experience!");

        await CreateReview(_karthikToken, GardenBangalore, b13, 4,
            "Really enjoyed our stay here. The garden setting is unique and peaceful. King suite was spacious with a lovely garden view. The restaurant serves excellent South Indian and continental food. Will come back!");

        // Palm Grove Goa — 2 reviews
        var b14 = await GetBookingId(_ananyaToken, PalmGoa);
        var b15 = await GetBookingId(_karthikToken, PalmGoa);

        await CreateReview(_ananyaToken, PalmGoa, b14, 5,
            "Palm Grove Resort is absolutely stunning! The tropical setting with palm trees everywhere is magical. Multiple pools, excellent dining, and direct beach access. This is what Goa dreams are made of!");

        await CreateReview(_karthikToken, PalmGoa, b15, 5,
            "Best resort in Goa hands down! The facilities are incredible — three pools, a spa, fine dining and beach access all in one place. The staff are warm, professional and went above and beyond for us.");

        // Marina Bay Suites — 1 more review
        var b16 = await GetBookingId(_karthikToken, MarinaChennai);

        await CreateReview(_karthikToken, MarinaChennai, b16, 4,
            "Great hotel with lovely bay views! The Double room was comfortable and well-appointed. Room service was excellent and the dining options nearby are fantastic. Good value for the location and quality.");

        // Capital Comfort Delhi — 1 more review
        var b17 = await GetBookingId(_rohanToken, CapitalDelhiId);

        await CreateReview(_rohanToken, CapitalDelhiId, b17, 5,
            "Capital Comfort Inn truly lives up to its name! The pool and gym are top-notch. Location in New Delhi is perfect for sightseeing. Staff were incredibly helpful with tour recommendations. Highly recommend!");

        // Cyber City Suites — 1 review
        var b18 = await GetBookingId(_meeraToken, CyberHyd);

        await CreateReview(_meeraToken, CyberHyd, b18, 4,
            "Perfect for business travel in Hyderabad! Located right in HITEC City with excellent connectivity. The gym is well-equipped and room service is prompt. Clean, modern rooms with all the amenities you need.");

        // Seaview Residency — 1 more review
        var b19 = await GetBookingId(_ananyaToken, SeaviewMumbai);

        await CreateReview(_ananyaToken, SeaviewMumbai, b19, 4,
            "Lovely boutique hotel near Juhu Beach! The sea view from our room was beautiful. Pool area is well-maintained and the staff are friendly. Great location for exploring Mumbai. Would stay again!");
    }

    // ══════════════════════════════════════════
    // HTTP HELPERS
    // ══════════════════════════════════════════

    static async Task<string> Login(string email, string password)
    {
        var response = await PostAsync("/identity/api/v1/auth/login",
            new { email, password }, null);
        return response?["token"]?.ToString()
            ?? throw new Exception($"Login failed for {email}");
    }

    static async Task CreateBooking(string token, object data)
    {
        await PostAsync("/booking/api/v1/bookings", data, token);
    }

    static async Task<int> GetBookingId(string token, int hotelId)
    {
        var json = await GetRawAuth(
            "/booking/api/v1/bookings/my-bookings?pageNumber=1&pageSize=100",
            token);

        var result = JsonConvert.DeserializeObject<Dictionary<string, object?>>(json)
            ?? throw new Exception("Failed to fetch bookings");

        var itemsJson = result["items"]?.ToString()
            ?? throw new Exception("No items in booking response");

        var items = JsonConvert.DeserializeObject<List<Dictionary<string, object?>>>(itemsJson)
            ?? throw new Exception("Failed to deserialize bookings");

        // Get the most recent booking for this hotel that has no review yet
        var booking = items
            .Where(b => int.Parse(b["hotelId"]?.ToString() ?? "0") == hotelId)
            .OrderByDescending(b => int.Parse(b["id"]?.ToString() ?? "0"))
            .FirstOrDefault()
            ?? throw new Exception($"Booking not found for hotel {hotelId}");

        return int.Parse(booking["id"]?.ToString()
            ?? throw new Exception("Booking ID missing"));
    }

    static async Task CreateReview(string token, int hotelId,
        int bookingId, int rating, string comment)
    {
        await PostAsync("/review/api/v1/reviews",
            new { hotelId, bookingId, rating, comment }, token);
    }

    static async Task<Dictionary<string, object?>?> PostAsync(
        string endpoint, object data, string? token)
    {
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        if (token != null)
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        else
            _client.DefaultRequestHeaders.Authorization = null;

        var response = await _client.PostAsync(endpoint, content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception(
                $"POST {endpoint} failed ({response.StatusCode}): {error}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(responseJson)) return null;
        return JsonConvert.DeserializeObject<Dictionary<string, object?>>(responseJson);
    }

    static async Task<string> GetRawAuth(string endpoint, string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var response = await _client.GetAsync(endpoint);
        if (!response.IsSuccessStatusCode)
            throw new Exception($"GET {endpoint} failed ({response.StatusCode})");
        return await response.Content.ReadAsStringAsync();
    }
}