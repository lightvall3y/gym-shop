using Microsoft.AspNetCore.Identity;

namespace GymShop.Api.Domain;

public class AppUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = "";
}

public class Category
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
}

public class Product
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Brand { get; set; } = "";
    /// <summary>"men", "women" or "unisex"</summary>
    public string Gender { get; set; } = "unisex";
    public bool Featured { get; set; }
    public List<ProductVariant> Variants { get; set; } = [];
}

public class ProductVariant
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Sku { get; set; } = "";
    public string Size { get; set; } = "";
    public string Color { get; set; } = "";
    public int Stock { get; set; }
}

public class Cart
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<CartItem> Items { get; set; } = [];
}

public class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Guid VariantId { get; set; }
    public ProductVariant Variant { get; set; } = null!;
    public int Quantity { get; set; }
}

public enum OrderStatus
{
    Placed,
    Shipped,
    Delivered,
    Cancelled,
}

public class Order
{
    public Guid Id { get; set; }
    /// <summary>Human-friendly number such as GS-1001</summary>
    public string Number { get; set; } = "";
    public Guid UserId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? TrackingNumber { get; set; }
    public string ShippingName { get; set; } = "";
    public string ShippingAddress { get; set; } = "";
    public string ShippingCity { get; set; } = "";
    public string ShippingPostalCode { get; set; } = "";
    public string ShippingCountry { get; set; } = "";
    public List<OrderItem> Items { get; set; } = [];
}

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid VariantId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductSlug { get; set; } = "";
    public string Size { get; set; } = "";
    public string Color { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class ChatSession
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ChatMessage> Messages { get; set; } = [];
}

public class ChatMessage
{
    public Guid Id { get; set; }
    public Guid ChatSessionId { get; set; }
    /// <summary>"user" or "assistant"</summary>
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
    /// <summary>Comma-separated names of tools the assistant called while producing this message.</summary>
    public string? ToolsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}
