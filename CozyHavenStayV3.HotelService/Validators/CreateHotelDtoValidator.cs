using FluentValidation;
using CozyHavenStayV3.HotelService.DTOs.Hotel;

namespace CozyHavenStayV3.HotelService.Validators
{
    public class CreateHotelDtoValidator : AbstractValidator<CreateHotelDto>
    {
        public CreateHotelDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Hotel name is required.")
                .MaximumLength(150).WithMessage("Hotel name cannot exceed 150 characters.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
        }
    }
}