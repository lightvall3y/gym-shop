namespace GymShop.Api.Services;

public record UserDto(Guid Id, string Email, string DisplayName);
public record AuthResponse(string Token, UserDto User);
public record RegisterRequest(string Email, string Password, string DisplayName);
public record LoginRequest(string Email, string Password);

public record CategoryDto(string Slug, string Name);
public record VariantDto(Guid Id, string Sku, string Size, string Color, int Stock);
public record ProductSummaryDto(
    string Slug, string Name, string Brand, string Gender, decimal Price, string Category, bool InStock, bool Featured);
public record ProductDetailDto(
    string Slug, string Name, string Description, string Brand, string Gender, decimal Price,
    string Category, string CategorySlug, List<VariantDto> Variants);
public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);

public record CartLineDto(
    Guid VariantId, string ProductSlug, string ProductName, string Size, string Color,
    decimal UnitPrice, int Quantity, decimal LineTotal, int Stock);
public record CartDto(List<CartLineDto> Items, decimal Subtotal, decimal Shipping, decimal Total, int ItemCount);
public record CartItemInput(Guid VariantId, int Quantity);
public record CartItemsRequest(List<CartItemInput> Items);
public record QuantityRequest(int Quantity);

public record ShippingInfo(string Name, string Address, string City, string PostalCode, string Country);
public record PlaceOrderRequest(ShippingInfo Shipping);
public record OrderItemDto(string ProductName, string ProductSlug, string Size, string Color, decimal UnitPrice, int Quantity);
public record OrderDto(
    Guid Id, string Number, string Status, DateTime CreatedAt, decimal Subtotal, decimal Shipping, decimal Total,
    string? TrackingNumber, ShippingInfo ShippingTo, List<OrderItemDto> Items);

public record ChatRequest(Guid? SessionId, string Message);
public record SetFlagsRequest(Dictionary<string, bool> Flags);
