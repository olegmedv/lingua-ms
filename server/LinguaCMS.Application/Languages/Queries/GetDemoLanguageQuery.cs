using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Languages.Queries;

public record GetDemoLanguageQuery : IRequest<LanguageDto?>;

public class GetDemoLanguageHandler : IRequestHandler<GetDemoLanguageQuery, LanguageDto?>
{
    private readonly AppDbContext _db;
    public GetDemoLanguageHandler(AppDbContext db) => _db = db;

    public async Task<LanguageDto?> Handle(GetDemoLanguageQuery request, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrDefaultAsync(l => l.IsDemo && l.IsPublished, ct);
        if (lang == null) return null;

        return new LanguageDto { Id = lang.Id, Name = lang.Name, Description = lang.Description, ImageUrl = lang.ImageUrl, IsPublished = lang.IsPublished, IsDemo = lang.IsDemo };
    }
}
