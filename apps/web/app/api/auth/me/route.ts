import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/server-api";

export const dynamic = "force-dynamic";

// @uxid apps/web/app/api/auth/me/route::GET
export async function GET() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const upstream = await fetch(`${API_URL}/api/auth/me`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!upstream.ok) {
      const res = NextResponse.json({ error: "Not signed in." }, { status: 401 });
      res.cookies.delete(TOKEN_COOKIE); // expired / invalid token (e.g. after a data reset)
      return res;
    }
    return NextResponse.json({ user: await upstream.json() });
  } catch {
    return NextResponse.json({ error: "Backend unavailable." }, { status: 502 });
  }
}
