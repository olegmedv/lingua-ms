using LinguaCMS.Domain.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace LinguaCMS.Infrastructure.Services;

public class LocalFileStorage : IFileStorage
{
    private const string UploadsFolder = "uploads";
    private readonly IWebHostEnvironment _env;

    public LocalFileStorage(IWebHostEnvironment env) => _env = env;

    public async Task<string> SaveAsync(Stream content, string originalFileName, CancellationToken cancellationToken = default)
    {
        var dir = GetUploadsDir();
        Directory.CreateDirectory(dir);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(originalFileName)}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await content.CopyToAsync(stream, cancellationToken);

        return $"/{UploadsFolder}/{fileName}";
    }

    public void Delete(string url)
    {
        var fileName = Path.GetFileName(url);
        if (string.IsNullOrEmpty(fileName)) return;

        var filePath = Path.Combine(GetUploadsDir(), fileName);
        if (File.Exists(filePath))
            File.Delete(filePath);
    }

    private string GetUploadsDir()
        => Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), UploadsFolder);
}
