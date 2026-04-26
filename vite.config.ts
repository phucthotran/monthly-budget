import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.svg'],
      manifest: {
        background_color: '#0f172a',
        description: 'Quản lý dự chi, thu nhập và tiết kiệm (VND)',
        display: 'standalone',
        icons: [
          {
            purpose: 'any',
            sizes: 'any',
            src: '/favicon.svg',
            type: 'image/svg+xml',
          },
        ],
        lang: 'vi',
        name: 'Dự chi hàng tháng',
        short_name: 'Dự chi',
        start_url: '/',
        theme_color: '#0f172a',
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
