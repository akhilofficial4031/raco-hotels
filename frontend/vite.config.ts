import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increased to 1MB to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (
            id.includes("react") &&
            !id.includes("@ant-design") &&
            !id.includes("react-hook-form")
          ) {
            return "react-vendor";
          }

          // Ant Design core - separate from icons to reduce chunk size
          if (id.includes("antd") && !id.includes("@ant-design/icons")) {
            return "antd-core";
          }

          // Ant Design icons - large separate chunk
          if (id.includes("@ant-design/icons")) {
            return "antd-icons";
          }

          // Form-related libraries
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform/resolvers") ||
            id.includes("zod")
          ) {
            return "forms";
          }

          // Charts library
          if (id.includes("recharts")) {
            return "charts";
          }

          // Data fetching and utilities
          if (id.includes("swr") || id.includes("axios")) {
            return "data-utils";
          }

          // Feature modules - split by business domain
          if (id.includes("src/features/authentication")) {
            return "feature-auth";
          }

          if (id.includes("src/features/dashboard")) {
            return "feature-dashboard";
          }

          if (
            id.includes("src/features/hotels") ||
            id.includes("src/features/rooms") ||
            id.includes("src/features/room-type")
          ) {
            return "feature-hotels";
          }

          if (
            id.includes("src/features/bookings") ||
            id.includes("src/features/customer")
          ) {
            return "feature-bookings";
          }

          if (
            id.includes("src/features/amenities") ||
            id.includes("src/features/feature") ||
            id.includes("src/features/addon")
          ) {
            return "feature-amenities";
          }

          if (
            id.includes("src/features/promo-code") ||
            id.includes("src/features/payments") ||
            id.includes("src/features/reviews")
          ) {
            return "feature-business";
          }

          if (id.includes("src/features/users")) {
            return "feature-users";
          }

          // Shared components and utilities
          if (id.includes("src/shared")) {
            return "shared";
          }

          // Node modules that don't match above criteria
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Default chunk for remaining code
          return "main";
        },
      },
    },
    // Enable module preloading for better performance
    modulePreload: {
      polyfill: false, // Modern browsers support module preloading
    },
    // Optimize asset processing
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps for debugging (can be disabled in production)
    sourcemap: false,
    // Enable minification
    minify: "esbuild", // Faster than terser, good compression
    // Target modern browsers for smaller bundles
    target: "es2020",
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 5173,
  },
});
