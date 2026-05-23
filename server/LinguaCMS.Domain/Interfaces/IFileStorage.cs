namespace LinguaCMS.Domain.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(Stream content, string originalFileName, CancellationToken cancellationToken = default);
    void Delete(string url);
}
