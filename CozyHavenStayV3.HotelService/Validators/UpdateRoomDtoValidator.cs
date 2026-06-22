using FluentValidation;
using CozyHavenStayV3.HotelService.DTOs.Room;

namespace CozyHavenStayV3.HotelService.Validators
{
    public class UpdateRoomDtoValidator : AbstractValidator<UpdateRoomDto>
    {
        public UpdateRoomDtoValidator()
        {
            RuleFor(x => x.RoomSize)
                .NotEmpty().WithMessage("Room size is required.")
                .MaximumLength(50).WithMessage("Room size cannot exceed 50 characters.");

            RuleFor(x => x.BedType)
                .IsInEnum().WithMessage("Bed type must be Single, Double, or King.");

            RuleFor(x => x.BaseFare)
                .GreaterThan(0).WithMessage("Base fare must be greater than 0.");
        }
    }
}