using System.Security.Cryptography;
using System.Text;

namespace GymShop.Api.Services;

public static class Ids
{
    /// <summary>Deterministic GUID from a string, so seeded data has the same IDs on every reset.</summary>
    public static Guid From(string key) => new(MD5.HashData(Encoding.UTF8.GetBytes(key)));
}
