using CozyHavenStayV3.BookingService.Services.Implementations;

namespace CozyHavenStayV3.BookingService.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendBookingConfirmationAsync(string toEmail, BookingConfirmationData data);
    }
}