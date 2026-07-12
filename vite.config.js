import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // Increase precache file size limit to 5 MB
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // Cache images when users actually view them
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "question-images",
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },

      manifest: {
        name: "CBT Pro",
        short_name: "CBT Pro",
        description: "JAMB CBT practice platform",
        theme_color: "#163FCF",
        background_color: "#163FCF",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});