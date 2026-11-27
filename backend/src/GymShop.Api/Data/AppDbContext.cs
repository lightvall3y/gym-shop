using GymShop.Api.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, Microsoft.AspNetCore.Identity.IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> Variants => Set<ProductVariant>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Category>().HasIndex(c => c.Slug).IsUnique();

        b.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Price).HasPrecision(10, 2);
            e.Property(p => p.Slug).HasMaxLength(120);
            e.HasOne(p => p.Category).WithMany().HasForeignKey(p => p.CategoryId);
        });

        b.Entity<ProductVariant>(e =>
        {
            e.HasIndex(v => v.Sku).IsUnique();
            e.HasOne(v => v.Product).WithMany(p => p.Variants).HasForeignKey(v => v.ProductId);
        });

        b.Entity<Cart>(e =>
        {
            e.HasIndex(c => c.UserId).IsUnique();
            e.HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CartItem>(e =>
        {
            e.HasIndex(i => new { i.CartId, i.VariantId }).IsUnique();
            e.HasOne(i => i.Variant).WithMany().HasForeignKey(i => i.VariantId);
        });

        b.Entity<Order>(e =>
        {
            e.HasIndex(o => o.Number).IsUnique();
            e.HasIndex(o => o.UserId);
            e.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(o => o.Subtotal).HasPrecision(10, 2);
            e.Property(o => o.Shipping).HasPrecision(10, 2);
            e.Property(o => o.Total).HasPrecision(10, 2);
            e.HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrderItem>().Property(i => i.UnitPrice).HasPrecision(10, 2);

        b.Entity<ChatSession>(e =>
            e.HasMany(s => s.Messages).WithOne().HasForeignKey(m => m.ChatSessionId).OnDelete(DeleteBehavior.Cascade));
    }
}
