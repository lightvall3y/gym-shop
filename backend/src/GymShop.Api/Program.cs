using GymShop.Api.Admin;
using GymShop.Api.Chat;
using GymShop.Api.Data;
using GymShop.Api.Domain;
using GymShop.Api.Endpoints;
using GymShop.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// --- Database ---
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(config.GetConnectionString("Default") ?? config["DATABASE_URL"]
        ?? "Host=localhost;Port=5432;Database=gymshop;Username=gymshop;Password=gymshop"));

// --- Identity (users, password hashing) + JWT bearer auth ---
builder.Services.AddIdentityCore<AppUser>(o =>
    {
        o.Password.RequireNonAlphanumeric = false;
        o.Password.RequiredLength = 8;
        o.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = TokenService.Issuer,
            ValidAudience = TokenService.Audience,
            IssuerSigningKey = TokenService.SigningKey(config),
            ValidateIssuerSigningKey = true,
            NameClaimType = "name",
        };
    });
builder.Services.AddAuthorization();

// --- App services ---
builder.Services.AddSingleton<BugFlags>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<PricingService>();
builder.Services.AddScoped<ChatService>();
builder.Services.AddHttpClient(ChatService.HttpClientName, c =>
{
    // ANTHROPIC_BASE_URL lets tests point the chatbot at a fake (see scripts/mock-anthropic.mjs).
    var baseUrl = config["ANTHROPIC_BASE_URL"];
    c.BaseAddress = new Uri(string.IsNullOrWhiteSpace(baseUrl) ? "https://api.anthropic.com/" : baseUrl);
    c.Timeout = TimeSpan.FromMinutes(2);
});

var app = builder.Build();

// Unhandled errors -> JSON 500 (this is what the checkout_500 bug produces)
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    await ctx.Response.WriteAsJsonAsync(new { error = "Internal server error." });
}));

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapAuth();
app.MapCatalog();
app.MapCart();
app.MapOrders();
app.MapChat();
app.MapAdmin();

// --- Startup: migrate + seed ---
if (config.GetValue("SEED_ON_START", true))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    // The db container may still be starting; retry for a while.
    for (var attempt = 1; ; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            await Seeder.SeedAsync(db, scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>());
            break;
        }
        catch (Exception ex) when (attempt < 20)
        {
            logger.LogWarning("Database not ready (attempt {Attempt}): {Message}", attempt, ex.Message);
            await Task.Delay(2000);
        }
    }
}

app.Run();

public partial class Program;
