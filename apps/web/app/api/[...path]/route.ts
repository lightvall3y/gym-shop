import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/server-api";

export const dynamic = "force-dynamic";

/**
 * Catch-all proxy: /api/<anything> -> C# API, with the JWT from the HttpOnly cookie attached.
 * The admin endpoints are NOT reachable through here; call the C# API directly for those.
 * The response body is streamed through, which is what makes the chatbot's SSE work.
 */
async function proxy(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path[0] === "admin") return NextResponse.json({ error: "Not found." }, { status: 404 });

  const url = new URL(request.url);
  const target = `${API_URL}/api/${path.join("/")}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    const out = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) out.set("content-type", upstreamType);
    out.set("cache-control", "no-store");
    out.set("x-accel-buffering", "no");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch {
    return NextResponse.json({ error: "Backend unavailable." }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
