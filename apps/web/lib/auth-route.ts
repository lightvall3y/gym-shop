import "server-only";
import { NextResponse } from "next/server";
import { API_URL, TOKEN_COOKIE } from "./server-api";

/** Shared by the login and register route handlers: forward to the C# API, then store the JWT in an HttpOnly cookie. */
export async function authenticate(apiPath: string, request: Request) {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}${apiPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error ?? "Request failed." }, { status: upstream.status });
  }

  const res = NextResponse.json({ user: data.user }, { status: upstream.status });
  res.cookies.set(TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    // Set COOKIE_SECURE=true when serving over HTTPS.
    secure: process.env.COOKIE_SECURE === "true",
  });
  return res;
}
