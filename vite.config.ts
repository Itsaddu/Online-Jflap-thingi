import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const plugins = [
  react(),
  runtimeErrorOverlay(),
];

if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  Promise.all([
    import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
    import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
  ]).then(([cart, banner]) => {
    plugins.push(cart, banner);
  }).catch((err) => console.warn("Replit plugins unavailable:", err));
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/*"],
    },
  },
});
