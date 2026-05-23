using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Data;
using LinguaCMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Languages.Queries;

public class GetLanguagesHandler : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetLanguagesHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<LanguageDto>> Handle(GetLanguagesQuery request, CancellationToken ct)
    {
        var query = _db.Languages.AsQueryable();

        if (!_currentUser.IsAdmin)
            query = query.Where(l => l.IsPublished);

        return await query
            .Select(l => new LanguageDto { Id = l.Id, Name = l.Name, Description = l.Description, ImageUrl = l.ImageUrl, IsPublished = l.IsPublished, IsDemo = l.IsDemo })
            .ToListAsync(ct);
    }
}
