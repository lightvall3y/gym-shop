import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (and any other container platform).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
