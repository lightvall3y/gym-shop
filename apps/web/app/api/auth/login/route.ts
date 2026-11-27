import { authenticate } from "@/lib/auth-route";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return authenticate("/api/auth/login", request);
}
