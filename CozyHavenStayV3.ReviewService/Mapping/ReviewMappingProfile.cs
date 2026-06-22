using AutoMapper;
using CozyHavenStayV3.ReviewService.DTOs;
using CozyHavenStayV3.ReviewService.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CozyHavenStayV3.ReviewService.Mapping
{
    public class ReviewMappingProfile : Profile
    {
        public ReviewMappingProfile()
        {
            CreateMap<Review, ReviewDto>();
        }
    }
}