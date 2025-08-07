// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      // optional: svgr のオプションをここで渡せます
    }),
  ],
  // 必要なら allowedHosts も……
  // server: { allowedHosts: ['your-ngrok-subdomain.ngrok.io'] }
});
