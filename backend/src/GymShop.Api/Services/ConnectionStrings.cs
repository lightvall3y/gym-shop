using Npgsql;

namespace GymShop.Api.Services;

public static class ConnectionStrings
{
    /// <summary>
    /// Accepts either an Npgsql key/value connection string or a postgres:// URL (what Vercel / Neon / Supabase give you)
    /// and returns an Npgsql connection string.
    /// </summary>
    public static string Normalize(string value)
    {
        if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return value;

        var uri = new Uri(value);
        var userInfo = uri.UserInfo.Split(':', 2);
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);

        var b = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            // Each serverless instance keeps a small pool; many instances x big pools would exhaust the database.
            MaxPoolSize = 5,
            GssEncryptionMode = GssEncryptionMode.Disable, // no Kerberos in the slim runtime image
            SslMode = (query["sslmode"] ?? "prefer").ToLowerInvariant() switch
            {
                "disable" => SslMode.Disable,
                "require" => SslMode.Require,
                "verify-ca" => SslMode.VerifyCA,
                "verify-full" => SslMode.VerifyFull,
                _ => SslMode.Prefer,
            },
        };
        return b.ConnectionString;
    }
}
