import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function r2RemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return [];
  const url = new URL(raw);
  const protocol = url.protocol === "http:" ? "http" : "https";
  return [{ protocol, hostname: url.hostname, pathname: "/**" }];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2RemotePatterns(),
  },
};

export default withNextIntl(nextConfig);
