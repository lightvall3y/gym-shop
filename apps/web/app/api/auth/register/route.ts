import { authenticate } from "@/lib/auth-route";

export const dynamic = "force-dynamic";

// @uxid apps/web/app/api/auth/register/route::POST
export function POST(request: Request) {
  return authenticate("/api/auth/register", request);
}
