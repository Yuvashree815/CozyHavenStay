using FluentValidation;
using CozyHavenStayV3.HotelService.DTOs.Room;

namespace CozyHavenStayV3.HotelService.Validators
{
    public class FareCalculationRequestDtoValidator : AbstractValidator<FareCalculationRequestDto>
    {
        public FareCalculationRequestDtoValidator()
        {
            RuleFor(x => x.CheckIn)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Check-in date cannot be in the past.");

            RuleFor(x => x.CheckOut)
                .GreaterThan(x => x.CheckIn).WithMessage("Check-out date must be after check-in date.");
            RuleFor(x => x.NumberOfAdults)
                .GreaterThanOrEqualTo(1).WithMessage("At least one adult is required.");

            RuleFor(x => x.NumberOfChildren)
                .GreaterThanOrEqualTo(0).WithMessage("Number of children cannot be negative.");

            RuleFor(x => x.AllGuestAges)
                .Must((dto, ages) => ages.Count == dto.NumberOfAdults + dto.NumberOfChildren)
                .WithMessage("The number of guest ages provided must match the total number of adults and children.");

            RuleForEach(x => x.AllGuestAges)
                .GreaterThanOrEqualTo(0).WithMessage("Guest age cannot be negative.")
                .LessThanOrEqualTo(120).WithMessage("Guest age must be realistic.");
        }
    }
}