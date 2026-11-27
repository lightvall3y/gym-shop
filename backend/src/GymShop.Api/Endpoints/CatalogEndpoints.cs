using GymShop.Api.Data;
using GymShop.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Endpoints;

public static class CatalogEndpoints
{
    public static void MapCatalog(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (AppDbContext db) =>
            await db.Categories.AsNoTracking().OrderBy(c => c.Name).Select(c => new CategoryDto(c.Slug, c.Name)).ToListAsync());

        app.MapGet("/api/products", async (
            AppDbContext db, string? category, string? size, decimal? minPrice, decimal? maxPrice, string? q,
            bool? featured, string? sort, int? page, int? pageSize) =>
        {
            var query = db.Products.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(category)) query = query.Where(p => p.Category.Slug == category);
            if (!string.IsNullOrWhiteSpace(size)) query = query.Where(p => p.Variants.Any(v => v.Size == size));
            if (minPrice is not null) query = query.Where(p => p.Price >= minPrice);
            if (maxPrice is not null) query = query.Where(p => p.Price <= maxPrice);
            if (featured == true) query = query.Where(p => p.Featured);
            if (!string.IsNullOrWhiteSpace(q))
            {
                var like = $"%{q.Trim()}%";
                query = query.Where(p => EF.Functions.ILike(p.Name, like) || EF.Functions.ILike(p.Brand, like)
                                         || EF.Functions.ILike(p.Description, like));
            }

            query = sort switch
            {
                "price_asc" => query.OrderBy(p => p.Price).ThenBy(p => p.Name),
                "price_desc" => query.OrderByDescending(p => p.Price).ThenBy(p => p.Name),
                _ => query.OrderBy(p => p.Name),
            };

            var size_ = Math.Clamp(pageSize ?? 12, 1, 48);
            var page_ = Math.Max(page ?? 1, 1);
            var total = await query.CountAsync();
            var items = await query.Skip((page_ - 1) * size_).Take(size_)
                .Select(p => new ProductSummaryDto(p.Slug, p.Name, p.Brand, p.Gender, p.Price, p.Category.Name,
                    p.Variants.Any(v => v.Stock > 0), p.Featured))
                .ToListAsync();
            return Results.Ok(new PagedResult<ProductSummaryDto>(items, total, page_, size_));
        });

        app.MapGet("/api/products/{slug}", async (string slug, AppDbContext db) =>
        {
            var p = await db.Products.AsNoTracking().Include(x => x.Category).Include(x => x.Variants)
                .FirstOrDefaultAsync(x => x.Slug == slug);
            if (p is null) return ApiResults.Error(404, "Product not found.");

            var variants = p.Variants
                .OrderBy(v => v.Color)
                .ThenBy(v => int.TryParse(v.Size, out var n) ? n : Array.IndexOf(["S", "M", "L", "XL"], v.Size))
                .Select(v => new VariantDto(v.Id, v.Sku, v.Size, v.Color, v.Stock)).ToList();
            return Results.Ok(new ProductDetailDto(p.Slug, p.Name, p.Description, p.Brand, p.Gender, p.Price,
                p.Category.Name, p.Category.Slug, variants));
        });
    }
}
