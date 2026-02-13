using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguagesQuery : IRequest<List<LanguageDto>>;

public class GetLanguagesHandler : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
{
    private readonly AppDbContext _db;
    public GetLanguagesHandler(AppDbContext db) => _db = db;

    public async Task<List<LanguageDto>> Handle(GetLanguagesQuery request, CancellationToken ct)
    {
        return await _db.Languages
            .Where(l => l.IsPublished)
            .Select(l => new LanguageDto { Id = l.Id, Name = l.Name, Description = l.Description, ImageUrl = l.ImageUrl, IsPublished = l.IsPublished })
            .ToListAsync(ct);
    }
}
