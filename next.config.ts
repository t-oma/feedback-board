import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  distDir: process.env.FEEDBACK_BOARD_ENV === "test" ? ".next-e2e" : ".next",
};

export default nextConfig;
