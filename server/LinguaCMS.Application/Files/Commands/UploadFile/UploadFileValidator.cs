using FluentValidation;

namespace LinguaCMS.Application.Files.Commands.UploadFile;

public class UploadFileValidator : AbstractValidator<UploadFileCommand>
{
    public UploadFileValidator()
    {
        RuleFor(x => x.Length).GreaterThan(0).WithMessage("Empty file");
    }
}
