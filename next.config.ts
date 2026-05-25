import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build to static HTML/CSS/JS in `out/` so the site can be hosted anywhere
  // (Vercel, GitHub Pages, or any static file server) with nothing to run.
  output: "export",

  // Static export can't use the on-demand Image Optimization server.
  images: { unoptimized: true },

  // Emit `path/index.html` instead of `path.html` so links work on plain
  // static hosts without server rewrites.
  trailingSlash: true,

  // For GitHub Pages under https://<user>.github.io/<repo>/, uncomment and set:
  // basePath: "/algorithms",
};

export default nextConfig;
