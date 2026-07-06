using AutoMapper;
using CozyHavenStayV3.HotelService.DTOs.Hotel;
using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Mapping
{
    public class HotelMappingProfile : Profile
    {
        public HotelMappingProfile()
        {
            CreateMap<Hotel, HotelDto>();
            CreateMap<Hotel, HotelSummaryDto>();

            
            CreateMap<CreateHotelDto, Hotel>();
            CreateMap<UpdateHotelDto, Hotel>();
        }
    }
}