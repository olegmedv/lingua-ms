using LinguaCMS.Application.Extensions;
using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public record UpdateLanguageCommand(Guid Id, string Name, string Description, string? ImageUrl, bool IsPublished, bool IsDemo) : IRequest<LanguageDto>;

public class UpdateLanguageHandler : IRequestHandler<UpdateLanguageCommand, LanguageDto>
{
    private readonly AppDbContext _db;
    public UpdateLanguageHandler(AppDbContext db) => _db = db;

    public async Task<LanguageDto> Handle(UpdateLanguageCommand request, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        lang.Name = request.Name;
        lang.Description = request.Description;
        lang.ImageUrl = request.ImageUrl;
        lang.IsPublished = request.IsPublished;
        lang.IsDemo = request.IsDemo;

        await _db.SaveChangesAsync(ct);

        return new LanguageDto { Id = lang.Id, Name = lang.Name, Description = lang.Description, ImageUrl = lang.ImageUrl, IsPublished = lang.IsPublished, IsDemo = lang.IsDemo };
    }
}
