import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks for large libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            // TanStack ecosystem
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }

            // Forms and validation
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms';
            }

            // RadixUI components (group related ones)
            if (id.includes('@radix-ui')) {
              if (id.includes('dialog') || id.includes('sheet') || id.includes('popover')) {
                return 'vendor-radix-overlays';
              }
              if (id.includes('select') || id.includes('dropdown') || id.includes('navigation')) {
                return 'vendor-radix-inputs';
              }
              return 'vendor-radix-ui';
            }

            // Utilities and icons
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }

            // Other large vendors
            return 'vendor-misc';
          }

          // App chunks for heavy files
          if (id.includes('/src/hooks/use-repair-tickets') ||
              id.includes('/src/hooks/use-customers') ||
              id.includes('/src/hooks/use-parts-management') ||
              id.includes('/src/hooks/use-analytics')) {
            return 'hooks-heavy';
          }

          if (id.includes('/src/components/pages/')) {
            return 'pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit since we're managing chunks manually
  },
  server: {
    allowedHosts: ['vite.tantran.dev'],
    proxy: {
      '/supabase': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
        rewrite: (path) => path.replace(/^\/supabase/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
          // Handle WebSocket upgrade
          proxy.on('proxyReqWs', (_proxyReq, req, _socket, _options, _head) => {
            console.log('WebSocket proxy request:', req.url);
          });
        },
      }
    }
  },
  // @ts-ignore - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})
