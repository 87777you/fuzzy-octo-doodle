import type { NextConfig } from "next";

// 静的ビルド（frontend/dist）を出力する。Cloudflare Pages などの静的配信を前提とする。
const config: NextConfig = {
  output: "export",
  distDir: "dist",
};

export default config;
