using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Data;
using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public class CreateLanguageHandler : IRequestHandler<CreateLanguageCommand, LanguageDto>
{
    private readonly AppDbContext _db;
    public CreateLanguageHandler(AppDbContext db) => _db = db;

    public async Task<LanguageDto> Handle(CreateLanguageCommand request, CancellationToken ct)
    {
        var lang = new Language
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            IsPublished = request.IsPublished,
            IsDemo = request.IsDemo,
            CreatedAt = DateTime.UtcNow
        };

        _db.Languages.Add(lang);
        await _db.SaveChangesAsync(ct);

        return new LanguageDto { Id = lang.Id, Name = lang.Name, Description = lang.Description, ImageUrl = lang.ImageUrl, IsPublished = lang.IsPublished, IsDemo = lang.IsDemo };
    }
}
