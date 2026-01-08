import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // Hier lag der Fehler - wir nutzen @vitejs/

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Verbindung zum Node.js Backend (Port 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})