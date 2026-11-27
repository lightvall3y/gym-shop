using GymShop.Api.Data;
using GymShop.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Services;

/// <summary>Names of the deliberate bugs that can be switched on for Eva to find.</summary>
public static class Bug
{
    public const string CartTotalWrong = "cart_total_wrong";
    public const string Checkout500 = "checkout_500";
    public const string StockIgnored = "stock_ignored";
    public const string LoginWrongError = "login_wrong_error";
    public const string ChatInventsPolicy = "chat_invents_policy";
    public const string ChatLeaksOtherOrders = "chat_leaks_other_orders";

    public static readonly string[] All =
    [
        CartTotalWrong, Checkout500, StockIgnored, LoginWrongError, ChatInventsPolicy, ChatLeaksOtherOrders,
    ];
}

/// <summary>
/// Bug toggles. Defaults come from the BUGS env var (comma-separated); runtime overrides set through
/// /api/admin/flags are stored in the database, so it works with several API instances (e.g. on Vercel).
/// Scoped: loaded once at the start of each request (see Program.cs), then read synchronously via Is().
/// </summary>
public class BugFlags(IConfiguration config, AppDbContext db)
{
    private readonly HashSet<string> _defaults = (config["BUGS"] ?? "")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    private Dictionary<string, bool> _overrides = new();

    public async Task LoadAsync(CancellationToken ct = default) =>
        _overrides = await db.FeatureFlags.AsNoTracking().ToDictionaryAsync(f => f.Key, f => f.Enabled, ct);

    public bool Is(string key) => _overrides.TryGetValue(key, out var on) ? on : _defaults.Contains(key);

    public IReadOnlyDictionary<string, bool> Snapshot() => Bug.All.ToDictionary(k => k, Is);

    public async Task SetAsync(IReadOnlyDictionary<string, bool> flags, CancellationToken ct = default)
    {
        var existing = await db.FeatureFlags.ToDictionaryAsync(f => f.Key, ct);
        foreach (var (key, enabled) in flags)
        {
            if (existing.TryGetValue(key, out var row)) row.Enabled = enabled;
            else db.FeatureFlags.Add(new FeatureFlag { Key = key, Enabled = enabled });
        }
        await db.SaveChangesAsync(ct);
        await LoadAsync(ct);
    }
}
