import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image. Vercel (VERCEL=1 during its builds) packages the app itself.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
};

export default nextConfig;
