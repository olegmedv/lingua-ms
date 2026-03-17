using System.Security.Cryptography;
using System.Text;

namespace LinguaCMS.Application.Common;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);

        var result = new byte[SaltSize + HashSize];
        salt.CopyTo(result, 0);
        hash.CopyTo(result, SaltSize);
        return Convert.ToBase64String(result);
    }

    public static bool Verify(string password, string hashedPassword)
    {
        var bytes = Convert.FromBase64String(hashedPassword);

        // Legacy SHA256 hash (32 bytes, no salt)
        if (bytes.Length == 32)
        {
            var sha256Hash = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return CryptographicOperations.FixedTimeEquals(sha256Hash, bytes);
        }

        // PBKDF2 hash (16-byte salt + 32-byte hash)
        var salt = bytes[..SaltSize];
        var hash = bytes[SaltSize..];
        var computedHash = Rfc2898DeriveBytes.Pbkdf2(
            password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return CryptographicOperations.FixedTimeEquals(hash, computedHash);
    }
}
