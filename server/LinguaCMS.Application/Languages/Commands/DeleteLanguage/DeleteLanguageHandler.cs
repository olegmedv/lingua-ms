using LinguaCMS.Application.Extensions;
using LinguaCMS.Data;
using MediatR;

namespace LinguaCMS.Application.Languages.Commands;

public class DeleteLanguageHandler : IRequestHandler<DeleteLanguageCommand>
{
    private readonly AppDbContext _db;
    public DeleteLanguageHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteLanguageCommand request, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrNotFoundAsync(l => l.Id == request.Id, ct);

        lang.IsDeleted = true;
        lang.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
