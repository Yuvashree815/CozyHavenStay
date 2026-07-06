using AutoMapper;
using CozyHavenStayV3.IdentityService.DTOs.Account;
using CozyHavenStayV3.IdentityService.Models;

namespace CozyHavenStayV3.IdentityService.Mapping
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));

            CreateMap<User, UserListDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));
        }
    }
}