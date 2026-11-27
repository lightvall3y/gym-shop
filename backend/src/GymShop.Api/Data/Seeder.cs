using GymShop.Api.Domain;
using GymShop.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Data;

/// <summary>Deterministic demo data. Same IDs, products and orders after every reset.</summary>
public static class Seeder
{
    public const string DemoPassword = "Demo123!";

    private record P(string Name, string Cat, string Brand, string Gender, decimal Price, string Desc, bool Featured = false);

    private static readonly P[] Products =
    [
        // Tops
        new("Apex Compression Tee", "tops", "Apex", "men", 34m, "Tight-fit compression tee that keeps muscles warm and sweat off your skin.", true),
        new("Forge Performance Tank", "tops", "Forge", "men", 24m, "Light, breathable tank for heavy lifting days."),
        new("Stride Seamless Sports Bra", "tops", "Stride", "women", 38m, "Medium-support seamless sports bra with a soft, stretchy feel.", true),
        new("Apex Training Hoodie", "tops", "Apex", "unisex", 69m, "Heavyweight fleece hoodie for warm-ups and cool-downs."),
        new("Forge Long Sleeve Dri-Fit", "tops", "Forge", "men", 42m, "Moisture-wicking long sleeve for outdoor runs."),
        new("Stride Cropped Tee", "tops", "Stride", "women", 29m, "Relaxed cropped tee in soft stretch cotton."),
        new("Ironclad Windbreaker", "tops", "Ironclad", "unisex", 89m, "Packable, water-resistant windbreaker.", true),
        new("Stride Quarter-Zip Pullover", "tops", "Stride", "women", 64m, "Brushed-back quarter-zip for chilly mornings."),
        // Bottoms
        new("Forge Training Shorts", "bottoms", "Forge", "men", 36m, "Durable 9-inch shorts with zip pockets."),
        new("Apex 7-Inch Running Shorts", "bottoms", "Apex", "men", 32m, "Featherweight running shorts with built-in liner."),
        new("Stride High-Waist Leggings", "bottoms", "Stride", "women", 58m, "Squat-proof high-waist leggings with a hidden pocket.", true),
        new("Stride Seamless Leggings", "bottoms", "Stride", "women", 62m, "Contour-fit seamless leggings."),
        new("Ironclad Tapered Joggers", "bottoms", "Ironclad", "unisex", 59m, "Tapered fit joggers in soft French terry."),
        new("Forge Lightweight Track Pants", "bottoms", "Forge", "men", 54m, "Straight-leg track pants with ankle zips."),
        new("Apex Cycling Shorts", "bottoms", "Apex", "women", 28m, "Padded-free cycling shorts for spin class."),
        new("Stride Biker Shorts", "bottoms", "Stride", "women", 30m, "Mid-thigh biker shorts with a wide waistband."),
        // Shoes
        new("Velocity Runner", "shoes", "Velocity", "unisex", 129m, "Responsive everyday road running shoe with a springy foam midsole.", true),
        new("Forge Lifter Pro", "shoes", "Forge", "unisex", 149m, "Flat, stable lifting shoe with a raised heel and strap."),
        new("Stride Trail Blazer", "shoes", "Stride", "unisex", 139m, "Grippy trail shoe with a rock plate."),
        new("Apex Cross-Trainer", "shoes", "Apex", "unisex", 119m, "Versatile cross-training shoe for lifting, rope climbs and sprints.", true),
        new("Ironclad Court Low", "shoes", "Ironclad", "unisex", 99m, "Low-profile court sneaker for gym-to-street wear."),
        new("Velocity Marathon Elite", "shoes", "Velocity", "unisex", 189m, "Carbon-plated race-day shoe."),
        new("Stride Daily Trainer", "shoes", "Stride", "unisex", 109m, "Cushioned daily trainer for easy miles."),
        new("Forge Minimal Barefoot", "shoes", "Forge", "unisex", 89m, "Zero-drop barefoot shoe with a wide toe box."),
        // Accessories
        new("Apex Gym Duffel Bag", "accessories", "Apex", "unisex", 59m, "40L duffel with a separate shoe compartment."),
        new("Forge Lifting Straps", "accessories", "Forge", "unisex", 14m, "Cotton lifting straps for deadlifts and rows."),
        new("Stride Yoga Mat", "accessories", "Stride", "unisex", 39m, "6mm non-slip yoga mat."),
        new("Ironclad Insulated Bottle", "accessories", "Ironclad", "unisex", 24m, "750ml steel bottle, keeps drinks cold for 24 hours."),
        new("Apex Resistance Band Set", "accessories", "Apex", "unisex", 27m, "Set of five resistance bands with a carry pouch."),
        new("Forge Training Gloves", "accessories", "Forge", "unisex", 22m, "Padded gloves for pull-ups and heavy lifts."),
    ];

    private static readonly string[] ApparelSizes = ["S", "M", "L", "XL"];
    private static readonly string[] ShoeSizes = ["40", "41", "42", "43", "44", "45", "46"];
    private static readonly string[][] ColorPairs =
        [["Black", "Navy"], ["Grey", "Black"], ["White", "Black"], ["Olive", "Black"], ["Navy", "Grey"]];

    public static string Slugify(string name) => name.ToLowerInvariant().Replace(' ', '-');

    public static async Task SeedAsync(AppDbContext db, UserManager<AppUser> users)
    {
        if (await db.Categories.AnyAsync()) return;

        // Categories
        var categories = new[] { ("tops", "Tops"), ("bottoms", "Bottoms"), ("shoes", "Shoes"), ("accessories", "Accessories") }
            .ToDictionary(c => c.Item1, c => new Category { Id = Ids.From("cat:" + c.Item1), Slug = c.Item1, Name = c.Item2 });
        db.Categories.AddRange(categories.Values);

        // Products + variants
        for (var i = 0; i < Products.Length; i++)
        {
            var p = Products[i];
            var slug = Slugify(p.Name);
            var product = new Product
            {
                Id = Ids.From("product:" + slug), Slug = slug, Name = p.Name, Description = p.Desc, Price = p.Price,
                CategoryId = categories[p.Cat].Id, Brand = p.Brand, Gender = p.Gender, Featured = p.Featured,
            };
            var sizes = p.Cat switch { "shoes" => ShoeSizes, "accessories" => ["One size"], _ => ApparelSizes };
            // accessories only come in one colour
            var colors = p.Cat == "accessories" ? [ColorPairs[i % ColorPairs.Length][0]] : ColorPairs[i % ColorPairs.Length];
            foreach (var color in colors)
                foreach (var size in sizes)
                {
                    var sku = $"{slug}-{color}-{size}".ToLowerInvariant().Replace(' ', '-');
                    product.Variants.Add(new ProductVariant
                    {
                        Id = Ids.From("variant:" + sku), Sku = sku, Size = size, Color = color, Stock = StockFor(slug, sku, color, size),
                    });
                }
            db.Products.Add(product);
        }

        // Users
        var demoUsers = new[]
        {
            ("demo@gymshop.test", "Alex Demo"),
            ("sam@gymshop.test", "Sam Runner"),
            ("new@gymshop.test", "Nina New"),
        };
        foreach (var (email, name) in demoUsers)
        {
            var result = await users.CreateAsync(
                new AppUser { Id = Ids.From("user:" + email), UserName = email, Email = email, EmailConfirmed = true, DisplayName = name },
                DemoPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException("Seeding user failed: " + string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        await db.SaveChangesAsync();

        // Orders
        var alex = Ids.From("user:demo@gymshop.test");
        var sam = Ids.From("user:sam@gymshop.test");
        var shipAlex = new ShippingInfo("Alex Demo", "Storgatan 12", "Stockholm", "111 29", "Sweden");
        var shipSam = new ShippingInfo("Sam Runner", "Nygade 4", "Copenhagen", "1164", "Denmark");

        await AddOrder(db, "GS-1001", alex, OrderStatus.Delivered, new DateTime(2026, 9, 2, 10, 15, 0, DateTimeKind.Utc), "TRK-1001-SE", shipAlex,
            ("forge-training-shorts", "M", 1), ("apex-training-hoodie", "L", 1));
        await AddOrder(db, "GS-1002", alex, OrderStatus.Shipped, new DateTime(2026, 11, 20, 14, 40, 0, DateTimeKind.Utc), "TRK-1002-SE", shipAlex,
            ("velocity-runner", "42", 1));
        await AddOrder(db, "GS-1003", alex, OrderStatus.Placed, new DateTime(2026, 11, 25, 9, 5, 0, DateTimeKind.Utc), null, shipAlex,
            ("stride-yoga-mat", "One size", 1), ("forge-lifting-straps", "One size", 2));
        await AddOrder(db, "GS-1004", alex, OrderStatus.Cancelled, new DateTime(2026, 10, 10, 18, 30, 0, DateTimeKind.Utc), null, shipAlex,
            ("apex-gym-duffel-bag", "One size", 1));
        await AddOrder(db, "GS-1005", sam, OrderStatus.Delivered, new DateTime(2026, 10, 15, 12, 0, 0, DateTimeKind.Utc), "TRK-1005-DK", shipSam,
            ("stride-seamless-leggings", "M", 1), ("stride-seamless-sports-bra", "M", 1));
        await AddOrder(db, "GS-1006", sam, OrderStatus.Shipped, new DateTime(2026, 11, 22, 16, 20, 0, DateTimeKind.Utc), "TRK-1006-DK", shipSam,
            ("stride-trail-blazer", "40", 1));
        await AddOrder(db, "GS-1007", sam, OrderStatus.Placed, new DateTime(2026, 11, 26, 8, 45, 0, DateTimeKind.Utc), null, shipSam,
            ("ironclad-insulated-bottle", "One size", 1));

        await db.SaveChangesAsync();
    }

    /// <summary>Stable stock levels, with a few hand-picked edge cases for tests and chatbot questions.</summary>
    private static int StockFor(string productSlug, string sku, string color, string size)
    {
        // Completely sold out product
        if (productSlug == "apex-compression-tee") return 0;
        // Velocity Runner: 43 is sold out, 42 is almost gone
        if (productSlug == "velocity-runner" && size == "43") return 0;
        if (productSlug == "velocity-runner" && size == "42") return 2;
        // One size left
        if (productSlug == "stride-high-waist-leggings" && size == "S") return 1;
        var hash = sku.Aggregate(17, (h, c) => unchecked(h * 31 + c));
        return 3 + Math.Abs(hash % 10);
    }

    private static async Task AddOrder(
        AppDbContext db, string number, Guid userId, OrderStatus status, DateTime createdAt, string? tracking,
        ShippingInfo ship, params (string Slug, string Size, int Qty)[] lines)
    {
        var order = new Order
        {
            Id = Ids.From("order:" + number), Number = number, UserId = userId, Status = status, CreatedAt = createdAt,
            TrackingNumber = tracking, ShippingName = ship.Name, ShippingAddress = ship.Address, ShippingCity = ship.City,
            ShippingPostalCode = ship.PostalCode, ShippingCountry = ship.Country,
        };
        foreach (var (slug, size, qty) in lines)
        {
            var variant = await db.Variants.Include(v => v.Product)
                .Where(v => v.Product.Slug == slug && v.Size == size).OrderBy(v => v.Sku).FirstAsync();
            order.Items.Add(new OrderItem
            {
                Id = Ids.From($"orderitem:{number}:{variant.Sku}"), VariantId = variant.Id, ProductName = variant.Product.Name,
                ProductSlug = slug, Size = variant.Size, Color = variant.Color, UnitPrice = variant.Product.Price, Quantity = qty,
            });
        }
        order.Subtotal = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        order.Shipping = order.Subtotal >= PricingService.FreeShippingThreshold ? 0 : PricingService.ShippingFee;
        order.Total = order.Subtotal + order.Shipping;
        db.Orders.Add(order);
    }
}
