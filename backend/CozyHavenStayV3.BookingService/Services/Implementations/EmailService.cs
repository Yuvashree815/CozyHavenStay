using System.Net;
using System.Net.Mail;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Services.Implementations
{
    public class BookingConfirmationData
    {
        public int BookingId { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string HotelName { get; set; } = string.Empty;
        public string HotelLocation { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfAdults { get; set; }
        public int NumberOfChildren { get; set; }
        public decimal TotalFare { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendBookingConfirmationAsync(
            string toEmail, BookingConfirmationData data)
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"]!;
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]!);
            var senderEmail = _configuration["EmailSettings:SenderEmail"]!;
            var senderName = _configuration["EmailSettings:SenderName"]!;
            var appPassword = _configuration["EmailSettings:AppPassword"]!;

            var nights = (data.CheckOut.Date - data.CheckIn.Date).Days;
            var subject = $"Booking Confirmed — {data.HotelName} | CozyHavenStay";

            var body = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'>
<style>
  body {{ font-family: Arial, sans-serif; background: #f8f6f2; margin: 0; padding: 0; }}
  .container {{ max-width: 600px; margin: 40px auto; background: white;
                border-radius: 12px; overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
  .header {{ background: linear-gradient(135deg, #1a3c5e, #2d6a9f);
             padding: 2rem; text-align: center; }}
  .header h1 {{ color: white; margin: 0; font-size: 1.4rem; }}
  .header p {{ color: rgba(255,255,255,0.8); margin: 0.5rem 0 0; font-size: 0.9rem; }}
  .body {{ padding: 2rem; }}
  .body p {{ color: #5a5a7a; line-height: 1.6; margin-bottom: 0.75rem; }}
  .booking-ref {{ background: #f8f6f2; border: 2px dashed #c9a84c;
                  border-radius: 8px; padding: 1rem;
                  text-align: center; margin: 1rem 0; }}
  .booking-ref h2 {{ color: #1a3c5e; margin: 0; font-size: 1.5rem; }}
  .booking-ref p {{ color: #5a5a7a; margin: 0.25rem 0 0; font-size: 0.85rem; }}
  .details-table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; }}
  .details-table td {{ padding: 0.6rem 0.75rem;
                       border-bottom: 1px solid #e8e0d4; font-size: 0.875rem; }}
  .details-table td:first-child {{ color: #9090a8; width: 40%; }}
  .details-table td:last-child {{ color: #1a1a2e; font-weight: 600; }}
  .policy {{ background: #fff3cd; border: 1px solid #ffeeba;
             border-radius: 8px; padding: 0.75rem 1rem;
             color: #856404; font-size: 0.82rem; margin-top: 1rem; }}
  .footer {{ background: #f8f6f2; padding: 1rem 2rem;
             text-align: center; color: #9090a8; font-size: 0.8rem; }}
</style>
</head>
<body>
<div class='container'>
  <div class='header'>
    <h1>🏨 CozyHavenStay</h1>
    <p>Your booking is confirmed!</p>
  </div>
  <div class='body'>
    <p>Dear <strong>{data.GuestName}</strong>,</p>
    <p>Your booking has been confirmed. Here are your details:</p>
    <div class='booking-ref'>
      <h2>#{data.BookingId.ToString().PadLeft(6, '0')}</h2>
      <p>Booking Reference Number</p>
    </div>
    <table class='details-table'>
      <tr><td>Hotel</td><td>{data.HotelName}</td></tr>
      <tr><td>Location</td><td>📍 {data.HotelLocation}</td></tr>
      <tr><td>Room Type</td><td>🛏️ {data.RoomType} Bed</td></tr>
      <tr><td>Check-in</td><td>{data.CheckIn:ddd, dd MMM yyyy}</td></tr>
      <tr><td>Check-out</td><td>{data.CheckOut:ddd, dd MMM yyyy}</td></tr>
      <tr><td>Duration</td><td>{nights} night{(nights > 1 ? "s" : "")}</td></tr>
      <tr><td>Guests</td>
          <td>{data.NumberOfAdults} adult(s), {data.NumberOfChildren} child(ren)</td></tr>
      <tr><td>Payment Method</td><td>{data.PaymentMethod}</td></tr>
      <tr><td>Total Amount Paid</td>
          <td style='color: #1a3c5e;'>₹{data.TotalFare:N0}</td></tr>
    </table>
    <div class='policy'>
      <strong>🛡️ Cancellation Policy:</strong><br/>
      ✅ Full refund if cancelled 48+ hours before check-in<br/>
      ⚠️ 50% refund if cancelled 24-48 hours before check-in<br/>
      ❌ No refund if cancelled within 24 hours of check-in
    </div>
    <p style='margin-top: 1rem;'>
      Thank you for choosing CozyHavenStay. Have a wonderful stay!
    </p>
  </div>
  <div class='footer'>
    © 2026 CozyHavenStay · All rights reserved<br/>
    This is an automated email — please do not reply.
  </div>
</div>
</body>
</html>";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(senderEmail, appPassword),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);
            await client.SendMailAsync(message);
        }
    }
}