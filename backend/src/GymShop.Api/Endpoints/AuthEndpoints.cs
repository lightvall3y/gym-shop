using System.Net.Mail;
using GymShop.Api.Domain;
using GymShop.Api.Services;
using Microsoft.AspNetCore.Identity;

namespace GymShop.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuth(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/auth");

        g.MapPost("/register", async (RegisterRequest req, UserManager<AppUser> users, TokenService tokens) =>
        {
            if (string.IsNullOrWhiteSpace(req.DisplayName)) return ApiResults.Error(400, "Name is required.");
            if (!MailAddress.TryCreate(req.Email, out _)) return ApiResults.Error(400, "Enter a valid email address.");
            if (await users.FindByEmailAsync(req.Email) is not null)
                return ApiResults.Error(409, "An account with this email already exists.");

            var user = new AppUser { UserName = req.Email, Email = req.Email, DisplayName = req.DisplayName.Trim() };
            var result = await users.CreateAsync(user, req.Password ?? "");
            if (!result.Succeeded) return ApiResults.Error(400, string.Join(" ", result.Errors.Select(e => e.Description)));

            return Results.Json(new AuthResponse(tokens.Create(user), ToDto(user)), statusCode: 201);
        });

        g.MapPost("/login", async (LoginRequest req, UserManager<AppUser> users, TokenService tokens, BugFlags flags) =>
        {
            var user = await users.FindByEmailAsync(req.Email ?? "");
            var swap = flags.Is(Bug.LoginWrongError); // BUG: login_wrong_error swaps the two messages
            if (user is null)
                return ApiResults.Error(401, swap ? "Incorrect password." : "Invalid email or password.");
            if (!await users.CheckPasswordAsync(user, req.Password ?? ""))
                return ApiResults.Error(401, swap ? "No account found with that email." : "Invalid email or password.");

            return Results.Ok(new AuthResponse(tokens.Create(user), ToDto(user)));
        });

        g.MapGet("/me", async (HttpContext ctx, UserManager<AppUser> users) =>
        {
            var id = ctx.User.GetUserId();
            var user = id is null ? null : await users.FindByIdAsync(id.ToString()!);
            return user is null ? ApiResults.Error(401, "Not signed in.") : Results.Ok(ToDto(user));
        }).RequireAuthorization();
    }

    private static UserDto ToDto(AppUser u) => new(u.Id, u.Email!, u.DisplayName);
}
