import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 根据环境变量设置 base URL
const base = process.env.NODE_ENV === 'production' ? '/assistant/' : '/'

export default defineConfig({
  plugins: [vue()],
  base,
  server: {
    host: 'localhost',
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      '/AI': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  publicDir: 'public',
}) 