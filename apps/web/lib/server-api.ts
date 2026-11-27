import "server-only";
import { cookies } from "next/headers";

export const API_URL = process.env.API_URL ?? "http://localhost:5080";
export const TOKEN_COOKIE = "gs_token";

/** Fetch from the C# API inside server components / route handlers. Never cached, so reset + bug flags take effect at once. */
export async function apiGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}
