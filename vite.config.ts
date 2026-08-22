import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE?.trim() ? env.VITE_BASE.trim() : '/'

  return {
    base,
    esbuild: {
      supported: {
        destructuring: true,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        supported: {
          destructuring: true,
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        manifest: {
          background_color: '#0f172a',
          categories: ['finance', 'productivity'],
          description: 'Quản lý dự chi, thu nhập và tiết kiệm (VND)',
          display: 'standalone',
          icons: [
            {
              purpose: 'any',
              sizes: '192x192',
              src: 'icon-192.png',
              type: 'image/png',
            },
            {
              purpose: 'any',
              sizes: '512x512',
              src: 'icon-512.png',
              type: 'image/png',
            },
            {
              purpose: 'maskable',
              sizes: '512x512',
              src: 'icon-maskable-512.png',
              type: 'image/png',
            },
          ],
          id: '.',
          lang: 'vi',
          name: 'Monthly Budget',
          orientation: 'portrait',
          scope: '.',
          short_name: 'Monthly Budget',
          start_url: '.',
          theme_color: '#0f172a',
        },
        registerType: 'prompt',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,woff2}'],
          navigateFallbackDenylist: [/^\/__/],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
