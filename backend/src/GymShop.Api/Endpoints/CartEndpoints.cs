using GymShop.Api.Data;
using GymShop.Api.Domain;
using GymShop.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Endpoints;

public static class CartEndpoints
{
    private const int MaxPerLine = 10;

    public static void MapCart(this IEndpointRouteBuilder app)
    {
        // Anonymous price check, used by the guest (localStorage) cart in the browser.
        app.MapPost("/api/cart/quote", async (CartItemsRequest req, PricingService pricing) =>
            Results.Ok(await pricing.QuoteAsync(req.Items ?? [])));

        var g = app.MapGroup("/api/cart").RequireAuthorization();

        g.MapGet("", async (HttpContext ctx, AppDbContext db, PricingService pricing) =>
            Results.Ok(await Current(db, pricing, ctx.User.GetUserId()!.Value)));

        g.MapPost("/items", async (CartItemInput req, HttpContext ctx, AppDbContext db, PricingService pricing, BugFlags flags) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var error = await AddLine(db, flags, userId, req.VariantId, req.Quantity, add: true);
            if (error is not null) return error;
            return Results.Ok(await Current(db, pricing, userId));
        });

        g.MapPatch("/items/{variantId:guid}", async (Guid variantId, QuantityRequest req, HttpContext ctx, AppDbContext db,
            PricingService pricing, BugFlags flags) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var error = await AddLine(db, flags, userId, variantId, req.Quantity, add: false);
            if (error is not null) return error;
            return Results.Ok(await Current(db, pricing, userId));
        });

        // Merge a guest cart into the server cart after login. Lines that can't be added are skipped.
        g.MapPost("/merge", async (CartItemsRequest req, HttpContext ctx, AppDbContext db, PricingService pricing, BugFlags flags) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            foreach (var item in req.Items ?? [])
                await AddLine(db, flags, userId, item.VariantId, item.Quantity, add: true);
            return Results.Ok(await Current(db, pricing, userId));
        });

        g.MapDelete("", async (HttpContext ctx, AppDbContext db, PricingService pricing) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var cart = await db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is not null)
            {
                db.CartItems.RemoveRange(cart.Items);
                await db.SaveChangesAsync();
            }
            return Results.Ok(await Current(db, pricing, userId));
        });
    }

    private static async Task<CartDto> Current(AppDbContext db, PricingService pricing, Guid userId)
    {
        var items = await db.CartItems.AsNoTracking()
            .Where(i => db.Carts.Any(c => c.Id == i.CartId && c.UserId == userId))
            .Select(i => new CartItemInput(i.VariantId, i.Quantity)).ToListAsync();
        return await pricing.QuoteAsync(items);
    }

    /// <summary>Adds to (add=true) or sets (add=false) a line quantity. Quantity 0 removes the line.</summary>
    private static async Task<IResult?> AddLine(AppDbContext db, BugFlags flags, Guid userId, Guid variantId, int quantity, bool add)
    {
        if (quantity < 0 || (add && quantity == 0)) return ApiResults.Error(400, "Quantity must be positive.");

        var variant = await db.Variants.Include(v => v.Product).FirstOrDefaultAsync(v => v.Id == variantId);
        if (variant is null) return ApiResults.Error(404, "Item not found.");

        var cart = await db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart is null)
        {
            cart = new Cart { Id = Guid.NewGuid(), UserId = userId };
            db.Carts.Add(cart);
        }

        var line = cart.Items.FirstOrDefault(i => i.VariantId == variantId);
        var newQty = add ? (line?.Quantity ?? 0) + quantity : quantity;

        if (newQty > MaxPerLine) return ApiResults.Error(400, $"You can order at most {MaxPerLine} of the same item.");
        if (newQty > 0 && !flags.Is(Bug.StockIgnored) && newQty > variant.Stock)
            return ApiResults.Error(409, variant.Stock == 0
                ? $"{variant.Product.Name} ({variant.Size}) is out of stock."
                : $"Only {variant.Stock} left of {variant.Product.Name} ({variant.Size}).");

        if (newQty == 0)
        {
            if (line is not null) db.CartItems.Remove(line);
        }
        else if (line is null)
            db.CartItems.Add(new CartItem { Id = Guid.NewGuid(), CartId = cart.Id, VariantId = variantId, Quantity = newQty });
        else
            line.Quantity = newQty;

        await db.SaveChangesAsync();
        return null;
    }
}
