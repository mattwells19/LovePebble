import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../server/build",
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/socket": {
        secure: false,
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
});
