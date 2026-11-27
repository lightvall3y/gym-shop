using System.Text.Json;
using System.Text.Json.Serialization;
using GymShop.Api.Chat;
using GymShop.Api.Services;

namespace GymShop.Api.Endpoints;

public static class ChatEndpoints
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    /// <summary>
    /// POST /api/chat → Server-Sent Events. Event types: session, text, tool, error, done.
    /// Works for anonymous users; if a valid JWT is sent, order tools are unlocked.
    /// </summary>
    public static void MapChat(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/chat", async (ChatRequest req, HttpContext ctx, ChatService chat) =>
        {
            if (string.IsNullOrWhiteSpace(req.Message)) { await WriteError(ctx, 400, "Message is required."); return; }
            if (req.Message.Length > 2000) { await WriteError(ctx, 400, "Message is too long (max 2000 characters)."); return; }

            ctx.Response.ContentType = "text/event-stream";
            ctx.Response.Headers.CacheControl = "no-cache";
            ctx.Response.Headers["X-Accel-Buffering"] = "no";

            var userId = ctx.User.GetUserId();
            var userName = ctx.User.FindFirst("name")?.Value;
            try
            {
                await foreach (var evt in chat.RunAsync(userId, userName, req.SessionId, req.Message, ctx.RequestAborted))
                {
                    await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(evt, Json)}\n\n", ctx.RequestAborted);
                    await ctx.Response.Body.FlushAsync(ctx.RequestAborted);
                }
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                ctx.RequestServices.GetRequiredService<ILogger<ChatService>>().LogError(ex, "Chat failed");
                var err = new ChatEvent("error", "Something went wrong. Please try again.");
                await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(err, Json)}\n\n");
            }
        });
    }

    private static async Task WriteError(HttpContext ctx, int status, string message)
    {
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new { error = message });
    }
}
