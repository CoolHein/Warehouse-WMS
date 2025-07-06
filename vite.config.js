import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    allowedHosts: [
      ".replit.dev",
      ".repl.co",
      "localhost",
      "271d955c-eca7-4e57-aedd-455890150806-00-wmiq0xsssgul.janeway.replit.dev",
    ],
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
