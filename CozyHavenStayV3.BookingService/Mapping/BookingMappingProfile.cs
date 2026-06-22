using AutoMapper;
using CozyHavenStayV3.BookingService.DTOs;
using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.Mapping
{
    public class BookingMappingProfile : Profile
    {
        public BookingMappingProfile()
        {
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.GuestAges, opt => opt.MapFrom(src => src.Guests.Select(g => g.Age).ToList()));

            CreateMap<Payment, PaymentDto>();
        }
    }
}