#!/usr/bin/env node
// Tiny fake of the Anthropic Messages API (streaming + tool use), for running the chatbot without an API key
// or without spending tokens. Deterministic: handy for tests.
//   node scripts/mock-anthropic.mjs            (listens on :9090)
// Then start the API with  ANTHROPIC_API_KEY=mock  ANTHROPIC_BASE_URL=http://localhost:9090/
// (in docker compose use http://host.docker.internal:9090/).
import http from "node:http";

const PORT = Number(process.env.PORT ?? 9090);

const sse = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify({ type: event, ...data })}\n\n`);

function streamText(res, text) {
  sse(res, "message_start", { message: { id: "msg_mock", type: "message", role: "assistant", content: [], model: "mock", stop_reason: null } });
  sse(res, "content_block_start", { index: 0, content_block: { type: "text", text: "" } });
  for (const chunk of text.match(/.{1,12}/gs) ?? []) sse(res, "content_block_delta", { index: 0, delta: { type: "text_delta", text: chunk } });
  sse(res, "content_block_stop", { index: 0 });
  sse(res, "message_delta", { delta: { stop_reason: "end_turn" }, usage: { output_tokens: 10 } });
  sse(res, "message_stop", {});
}

function streamToolUse(res, name, input) {
  sse(res, "message_start", { message: { id: "msg_mock", type: "message", role: "assistant", content: [], model: "mock", stop_reason: null } });
  sse(res, "content_block_start", { index: 0, content_block: { type: "text", text: "" } });
  sse(res, "content_block_delta", { index: 0, delta: { type: "text_delta", text: "Let me check. " } });
  sse(res, "content_block_stop", { index: 0 });
  sse(res, "content_block_start", { index: 1, content_block: { type: "tool_use", id: "toolu_mock", name, input: {} } });
  sse(res, "content_block_delta", { index: 1, delta: { type: "input_json_delta", partial_json: JSON.stringify(input) } });
  sse(res, "content_block_stop", { index: 1 });
  sse(res, "message_delta", { delta: { stop_reason: "tool_use" }, usage: { output_tokens: 10 } });
  sse(res, "message_stop", {});
}

http
  .createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (req.method !== "POST" || req.url !== "/v1/messages") {
        res.writeHead(404).end();
        return;
      }
      const body = JSON.parse(raw);
      const tools = (body.tools ?? []).map((t) => t.name);
      const last = body.messages.at(-1);
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });

      // Second round: we just got tool results back -> summarise them.
      if (Array.isArray(last.content) && last.content[0]?.type === "tool_result") {
        const result = String(last.content[0].content);
        streamText(res, `Here is what I found: ${result.slice(0, 300)}`);
        return res.end();
      }

      const text = String(last.content).toLowerCase();
      const m = text.match(/gs-\d{4}/);
      if (m && tools.includes("get_order_status")) streamToolUse(res, "get_order_status", { order_number: m[0].toUpperCase() });
      else if (text.includes("order") && tools.includes("list_my_orders")) streamToolUse(res, "list_my_orders", {});
      else if (text.includes("order")) streamText(res, "Please log in at /account so I can look up your orders.");
      else if (text.includes("return")) streamToolUse(res, "get_return_policy", {});
      else if (text.includes("stock")) streamToolUse(res, "check_stock", { product_slug: "velocity-runner" });
      else streamText(res, "Hi! This is the mock assistant. Ask me about an order, returns or stock.");
      res.end();
    });
  })
  .listen(PORT, () => console.log(`mock Anthropic API on http://localhost:${PORT}`));
