using FluentValidation;
using CozyHavenStayV3.IdentityService.DTOs.Account;

namespace CozyHavenStayV3.IdentityService.Validators
{
    public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
    {
        public UpdateProfileDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(150).WithMessage("Full name cannot exceed 150 characters.");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\+?[0-9]{7,15}$").WithMessage("Phone number must be a valid number (7-15 digits, optional leading +).");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(300).WithMessage("Address cannot exceed 300 characters.");

            RuleFor(x => x.DateOfBirth)
                .Must(dob => !dob.HasValue || dob.Value.Date < DateTime.UtcNow.Date)
                .WithMessage("Date of birth must be a valid date in the past.")
                .When(x => x.DateOfBirth.HasValue);
        }
    }
}