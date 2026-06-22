using AutoMapper;
using CozyHavenStayV3.HotelService.DTOs.Room;
using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Mapping
{
    public class RoomMappingProfile : Profile
    {
        public RoomMappingProfile()
        {
            CreateMap<Room, RoomDto>();

            
            CreateMap<CreateRoomDto, Room>();
            CreateMap<UpdateRoomDto, Room>();
        }
    }
}