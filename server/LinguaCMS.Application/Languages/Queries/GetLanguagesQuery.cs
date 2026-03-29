using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguagesQuery(bool IsAdmin = false) : IRequest<List<LanguageDto>>;

public class GetLanguagesHandler : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
{
    private readonly AppDbContext _db;
    public GetLanguagesHandler(AppDbContext db) => _db = db;

    public async Task<List<LanguageDto>> Handle(GetLanguagesQuery request, CancellationToken ct)
    {
        var query = _db.Languages.AsQueryable();

        if (!request.IsAdmin)
            query = query.Where(l => l.IsPublished);

        return await query
            .Select(l => new LanguageDto { Id = l.Id, Name = l.Name, Description = l.Description, ImageUrl = l.ImageUrl, IsPublished = l.IsPublished, IsDemo = l.IsDemo })
            .ToListAsync(ct);
    }
}
