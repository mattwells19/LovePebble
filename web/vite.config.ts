import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "jsr:@std/path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../server/build",
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@lovepebble/server": path.resolve(Deno.cwd(), "../server/mod.ts"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/ws": {
        secure: false,
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
});
