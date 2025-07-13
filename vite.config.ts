import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Local Note",
        short_name: "LocalNote",
        description: "TypeScript와 SvelteKit을 사용한 로컬 메모장 앱",
        theme_color: "#0066cc",
        background_color: "#f8f9fa",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
