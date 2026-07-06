using FluentValidation;
using CozyHavenStayV3.ReviewService.DTOs;

namespace CozyHavenStayV3.ReviewService.Validators
{
    public class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
    {
        public CreateReviewDtoValidator()
        {
            RuleFor(x => x.HotelId).GreaterThan(0).WithMessage("A valid hotel must be specified.");
            RuleFor(x => x.BookingId).GreaterThan(0).WithMessage("A valid booking must be specified.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

            RuleFor(x => x.Comment)
                .NotEmpty().WithMessage("Comment is required.")
                .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters.");
        }
    }
}