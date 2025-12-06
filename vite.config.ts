import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for React + Tailwind.
export default defineConfig({
  // Set base for GitHub Pages deployment at /ZynChat/
  base: '/ZynChat/',
  plugins: [react()],
  server: {
    port: 5173
  }
})
