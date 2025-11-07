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
        manualChunks: {
          // Core React - include scheduler to avoid circular dependencies
          "react-vendor": ["react", "react-dom", "scheduler"],

          // React Router - separate chunk
          "react-router": ["react-router-dom", "react-router"],

          // Ant Design
          "antd-core": ["antd"],
          "antd-icons": ["@ant-design/icons"],

          // Forms
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],

          // Charts
          charts: ["recharts"],

          // Data fetching
          "data-utils": ["swr"],
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
