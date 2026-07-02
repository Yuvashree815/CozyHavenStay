using FluentValidation;
using CozyHavenStayV3.BookingService.DTOs;

namespace CozyHavenStayV3.BookingService.Validators
{
    public class CreateBookingDtoValidator : AbstractValidator<CreateBookingDto>
    {
        public CreateBookingDtoValidator()
        {
            RuleFor(x => x.HotelId).GreaterThan(0).WithMessage("A valid hotel must be selected.");
            RuleFor(x => x.RoomId).GreaterThan(0).WithMessage("A valid room must be selected.");

            RuleFor(x => x.CheckIn)
                                   .NotEmpty().WithMessage("Check-in date is required.")
                                   .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
                                   .WithMessage("Check-in date cannot be in the past.");

            RuleFor(x => x.CheckOut)
                                   .NotEmpty().WithMessage("Check-out date is required.")
                                   .GreaterThan(x => x.CheckIn)
                                   .WithMessage("Check-out date must be after check-in date (minimum 1 night).");


            RuleFor(x => x.CheckOut)
                .LessThanOrEqualTo(x => x.CheckIn.AddDays(30)).WithMessage("Maximum stay duration is 30 nights.");

            RuleFor(x => x.NumberOfAdults)
                .GreaterThanOrEqualTo(1).WithMessage("At least one adult is required.");

            RuleFor(x => x.NumberOfChildren)
                .GreaterThanOrEqualTo(0).WithMessage("Number of children cannot be negative.");

            RuleFor(x => x.GuestAges)
                .Must((dto, ages) => ages.Count == dto.NumberOfAdults + dto.NumberOfChildren)
                .WithMessage("The number of guest ages provided must match the total number of adults and children.");

            RuleForEach(x => x.GuestAges)
                .GreaterThanOrEqualTo(0).WithMessage("Guest age cannot be negative.")
                .LessThanOrEqualTo(120).WithMessage("Guest age must be realistic.");
        }
    }
}