// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  server: {
    host: true, // 0.0.0.0 でリッスン → LAN 内の他デバイスからアクセス可能
    port: 5173,
  },
});
