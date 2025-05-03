import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'E-Commerce Application',
        short_name: 'eCommerce',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Caching các static assets
            urlPattern: /\.(png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 ngày
              }
            }
          },
          {
            // Caching API categories 
            urlPattern: /\/api\/categories/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-categories',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 // 1 ngày
              }
            }
          },
          {
            // Caching API products public
            urlPattern: /\/api\/products(?!\/admin|\/seller).*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-products',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 giờ
              },
              networkTimeoutSeconds: 3 // Timeout sau 3 giây nếu mạng chậm
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false
      }
    }
  }
});