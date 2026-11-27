using GymShop.Api.Data;
using GymShop.Api.Domain;
using GymShop.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GymShop.Api.Admin;

/// <summary>Endpoints for Eva / test scripts: reset data, toggle deliberate bugs, read chat transcripts.</summary>
public static class AdminEndpoints
{
    public static void MapAdmin(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/admin").AddEndpointFilter(async (ctx, next) =>
        {
            var expected = ctx.HttpContext.RequestServices.GetRequiredService<IConfiguration>()["ADMIN_API_KEY"];
            if (string.IsNullOrEmpty(expected)) return ApiResults.Error(403, "Admin API is disabled (ADMIN_API_KEY is not set).");
            if (ctx.HttpContext.Request.Headers["X-Admin-Key"] != expected) return ApiResults.Error(401, "Invalid admin key.");
            return await next(ctx);
        });

        g.MapPost("/reset", async (AppDbContext db, UserManager<AppUser> users, BugFlags flags) =>
        {
            // Truncate instead of dropping the database: keeps pooled connections valid and is much faster.
            await db.Database.MigrateAsync();
            var tables = db.Model.GetEntityTypes().Select(t => t.GetTableName()).Where(n => n is not null).Distinct()
                .Select(n => $"\"{n}\"");
            await db.Database.ExecuteSqlRawAsync($"TRUNCATE TABLE {string.Join(", ", tables)} RESTART IDENTITY CASCADE");
            db.ChangeTracker.Clear();
            await Seeder.SeedAsync(db, users);
            flags.ResetToDefaults();
            return Results.Ok(new { status = "reset", flags = flags.Snapshot() });
        });

        g.MapGet("/flags", (BugFlags flags) => Results.Ok(flags.Snapshot()));

        g.MapPut("/flags", (SetFlagsRequest req, BugFlags flags) =>
        {
            var unknown = req.Flags.Keys.Where(k => !Bug.All.Contains(k)).ToList();
            if (unknown.Count > 0)
                return ApiResults.Error(400, $"Unknown flag(s): {string.Join(", ", unknown)}. Known: {string.Join(", ", Bug.All)}");
            foreach (var (key, on) in req.Flags) flags.Set(key, on);
            return Results.Ok(flags.Snapshot());
        });

        g.MapGet("/chat-sessions", async (AppDbContext db) =>
            Results.Ok(await db.ChatSessions.AsNoTracking().OrderByDescending(s => s.CreatedAt).Take(50)
                .Select(s => new { s.Id, s.UserId, s.CreatedAt, Messages = s.Messages.Count }).ToListAsync()));

        g.MapGet("/chat-sessions/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var s = await db.ChatSessions.AsNoTracking().Include(x => x.Messages).FirstOrDefaultAsync(x => x.Id == id);
            return s is null
                ? ApiResults.Error(404, "Session not found.")
                : Results.Ok(new
                {
                    s.Id, s.UserId, s.CreatedAt,
                    Messages = s.Messages.OrderBy(m => m.CreatedAt).Select(m => new { m.Role, m.Content, m.ToolsUsed, m.CreatedAt }),
                });
        });
    }
}
