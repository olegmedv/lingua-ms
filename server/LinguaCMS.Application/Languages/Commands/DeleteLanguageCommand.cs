using LinguaCMS.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Application.Languages.Commands;

public record DeleteLanguageCommand(Guid Id) : IRequest;

public class DeleteLanguageHandler : IRequestHandler<DeleteLanguageCommand>
{
    private readonly AppDbContext _db;
    public DeleteLanguageHandler(AppDbContext db) => _db = db;

    public async Task Handle(DeleteLanguageCommand request, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrDefaultAsync(l => l.Id == request.Id, ct)
            ?? throw new Exception("Language not found");

        _db.Languages.Remove(lang);
        await _db.SaveChangesAsync(ct);
    }
}
