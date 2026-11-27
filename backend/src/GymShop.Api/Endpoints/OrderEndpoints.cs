using GymShop.Api.Data;
using GymShop.Api.Domain;
using GymShop.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrders(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/orders").RequireAuthorization();

        g.MapGet("", async (HttpContext ctx, AppDbContext db) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var orders = await db.Orders.AsNoTracking().Include(o => o.Items)
                .Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Results.Ok(orders.Select(ToDto));
        });

        g.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, AppDbContext db) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var order = await db.Orders.AsNoTracking().Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
            return order is null ? ApiResults.Error(404, "Order not found.") : Results.Ok(ToDto(order));
        });

        g.MapPost("", async (PlaceOrderRequest req, HttpContext ctx, AppDbContext db, PricingService pricing, BugFlags flags) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var s = req.Shipping;
            if (s is null || new[] { s.Name, s.Address, s.City, s.PostalCode, s.Country }.Any(string.IsNullOrWhiteSpace))
                return ApiResults.Error(400, "Please fill in all shipping fields.");

            var cart = await db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null || cart.Items.Count == 0) return ApiResults.Error(400, "Your cart is empty.");

            // BUG: checkout_500 - checkout blows up with a server error
            if (flags.Is(Bug.Checkout500)) throw new InvalidOperationException("Simulated checkout failure (checkout_500).");

            var ids = cart.Items.Select(i => i.VariantId).ToList();
            var variants = await db.Variants.Include(v => v.Product).Where(v => ids.Contains(v.Id)).ToDictionaryAsync(v => v.Id);

            if (!flags.Is(Bug.StockIgnored))
                foreach (var item in cart.Items)
                {
                    var v = variants[item.VariantId];
                    if (item.Quantity > v.Stock)
                        return ApiResults.Error(409, $"Not enough stock for {v.Product.Name} ({v.Size}). Available: {v.Stock}.");
                }

            var quote = await pricing.QuoteAsync(cart.Items.Select(i => new CartItemInput(i.VariantId, i.Quantity)));
            var number = $"GS-{1001 + await db.Orders.CountAsync()}";
            var order = new Order
            {
                Id = Guid.NewGuid(), Number = number, UserId = userId, Status = OrderStatus.Placed, CreatedAt = DateTime.UtcNow,
                Subtotal = quote.Subtotal, Shipping = quote.Shipping, Total = quote.Total,
                ShippingName = s.Name, ShippingAddress = s.Address, ShippingCity = s.City,
                ShippingPostalCode = s.PostalCode, ShippingCountry = s.Country,
            };
            foreach (var item in cart.Items)
            {
                var v = variants[item.VariantId];
                v.Stock = Math.Max(0, v.Stock - item.Quantity);
                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(), VariantId = v.Id, ProductName = v.Product.Name, ProductSlug = v.Product.Slug,
                    Size = v.Size, Color = v.Color, UnitPrice = v.Product.Price, Quantity = item.Quantity,
                });
            }

            db.Orders.Add(order);
            db.CartItems.RemoveRange(cart.Items);
            await db.SaveChangesAsync();
            return Results.Json(ToDto(order), statusCode: 201);
        });

        g.MapPost("/{id:guid}/cancel", async (Guid id, HttpContext ctx, AppDbContext db) =>
        {
            var userId = ctx.User.GetUserId()!.Value;
            var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
            if (order is null) return ApiResults.Error(404, "Order not found.");
            if (order.Status != OrderStatus.Placed)
                return ApiResults.Error(409, $"Only orders that have not shipped can be cancelled (this one is {order.Status}).");

            order.Status = OrderStatus.Cancelled;
            foreach (var item in order.Items)
            {
                var v = await db.Variants.FindAsync(item.VariantId);
                if (v is not null) v.Stock += item.Quantity;
            }
            await db.SaveChangesAsync();
            return Results.Ok(ToDto(order));
        });
    }

    public static OrderDto ToDto(Order o) => new(
        o.Id, o.Number, o.Status.ToString(), o.CreatedAt, o.Subtotal, o.Shipping, o.Total, o.TrackingNumber,
        new ShippingInfo(o.ShippingName, o.ShippingAddress, o.ShippingCity, o.ShippingPostalCode, o.ShippingCountry),
        o.Items.Select(i => new OrderItemDto(i.ProductName, i.ProductSlug, i.Size, i.Color, i.UnitPrice, i.Quantity)).ToList());
}
