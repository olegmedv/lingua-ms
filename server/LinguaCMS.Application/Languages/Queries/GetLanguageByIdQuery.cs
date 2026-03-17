using LinguaCMS.Application.Extensions;
using LinguaCMS.Application.Languages.Models;
using LinguaCMS.Infrastructure.Data;
using MediatR;

namespace LinguaCMS.Application.Languages.Queries;

public record GetLanguageByIdQuery(Guid Id) : IRequest<LanguageDto>;

public class GetLanguageByIdHandler : IRequestHandler<GetLanguageByIdQuery, LanguageDto>
{
    private readonly AppDbContext _db;
    public GetLanguageByIdHandler(AppDbContext db) => _db = db;

    public async Task<LanguageDto> Handle(GetLanguageByIdQuery request, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        return new LanguageDto { Id = lang.Id, Name = lang.Name, Description = lang.Description, ImageUrl = lang.ImageUrl, IsPublished = lang.IsPublished };
    }
}
