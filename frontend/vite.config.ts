// Sửa file vite.config.ts để thêm proxy
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/iam': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    }
  }
});