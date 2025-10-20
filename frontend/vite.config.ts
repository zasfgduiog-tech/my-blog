import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wang/shine1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    },
    allowedHosts:['brigitte-dissociative-katelyn.ngrok-free.dev']
  }
})

