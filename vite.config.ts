import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  // Set NODE_ENV at build time via define (Vite v7 ignores NODE_ENV in .env)
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@trpc/react-query',
      '@tanstack/react-query'
    ],
    alias: {
      react: path.resolve(import.meta.dirname, "node_modules", "react"),
      'react-dom': path.resolve(import.meta.dirname, "node_modules", "react-dom"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // tRPC + React Query
          if (id.includes('@trpc/') || id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          // i18n
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n-vendor';
          }
          // Charts (recharts is large)
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'chart-vendor';
          }
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // Form utilities
          if (id.includes('zod') || id.includes('react-hook-form')) {
            return 'form-vendor';
          }
          // Admin pages
          if (id.includes('/pages/admin/') || id.includes('/pages/Admin')) {
            return 'admin-pages';
          }
          // Advertiser pages
          if (id.includes('/pages/advertiser/') || id.includes('/pages/Advertiser')) {
            return 'advertiser-pages';
          }
          // Date/time utilities
          if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
            return 'date-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    hmr: process.env.IS_LOCAL_DEV ? true : {
      clientPort: 443,
      protocol: 'wss',
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
