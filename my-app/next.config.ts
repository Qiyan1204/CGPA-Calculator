import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash: false, // Forces URLs without trailing slash (redirects /page/ to /page)
};

export default nextConfig;
