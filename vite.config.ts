import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID),
    'import.meta.env.VITE_SPOTIFY_REDIRECT_URI': JSON.stringify(process.env.VITE_SPOTIFY_REDIRECT_URI),
  },
})
