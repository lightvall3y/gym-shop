using System.Security.Claims;

namespace GymShop.Api.Services;

public static class UserExtensions
{
    /// <summary>User id from the JWT "sub" claim, or null for anonymous requests.</summary>
    public static Guid? GetUserId(this ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}

public static class ApiResults
{
    public static IResult Error(int status, string message) => Results.Json(new { error = message }, statusCode: status);
}
