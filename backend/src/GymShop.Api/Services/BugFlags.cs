using System.Collections.Concurrent;

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
/// Runtime-switchable bug toggles. Defaults come from the BUGS env var (comma-separated);
/// they can be changed through /api/admin/flags and are restored by /api/admin/reset.
/// </summary>
public class BugFlags
{
    private readonly ConcurrentDictionary<string, bool> _flags = new();
    private readonly HashSet<string> _defaults;

    public BugFlags(IConfiguration config)
    {
        _defaults = (config["BUGS"] ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        ResetToDefaults();
    }

    public bool Is(string key) => _flags.TryGetValue(key, out var on) && on;

    public IReadOnlyDictionary<string, bool> Snapshot() => Bug.All.ToDictionary(k => k, Is);

    public bool Set(string key, bool enabled)
    {
        if (!Bug.All.Contains(key)) return false;
        _flags[key] = enabled;
        return true;
    }

    public void ResetToDefaults()
    {
        foreach (var key in Bug.All) _flags[key] = _defaults.Contains(key);
    }
}
