import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // fallback all 404 requests to index.html
    fs: {
      strict: false
    }
  }
})
