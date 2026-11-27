using GymShop.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Services;

/// <summary>Single place where cart lines are priced; used by the cart endpoints and by checkout.</summary>
public class PricingService(AppDbContext db, BugFlags flags)
{
    public const decimal FreeShippingThreshold = 100m;
    public const decimal ShippingFee = 7.90m;

    public async Task<CartDto> QuoteAsync(IEnumerable<CartItemInput> items, CancellationToken ct = default)
    {
        var requested = items
            .Where(i => i.Quantity > 0)
            .GroupBy(i => i.VariantId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
        var ids = requested.Keys.ToList();

        var variants = await db.Variants.Include(v => v.Product).AsNoTracking()
            .Where(v => ids.Contains(v.Id)).ToListAsync(ct);

        var lines = variants.Select(v =>
        {
            var qty = requested[v.Id];
            // BUG: cart_total_wrong - the line total ignores the quantity
            var lineTotal = flags.Is(Bug.CartTotalWrong) ? v.Product.Price : v.Product.Price * qty;
            return new CartLineDto(v.Id, v.Product.Slug, v.Product.Name, v.Size, v.Color,
                v.Product.Price, qty, lineTotal, v.Stock);
        }).OrderBy(l => l.ProductName).ThenBy(l => l.Size).ToList();

        var subtotal = lines.Sum(l => l.LineTotal);
        var shipping = subtotal == 0 || subtotal >= FreeShippingThreshold ? 0m : ShippingFee;
        return new CartDto(lines, subtotal, shipping, subtotal + shipping, lines.Sum(l => l.Quantity));
    }
}
