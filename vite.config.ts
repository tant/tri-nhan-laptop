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
