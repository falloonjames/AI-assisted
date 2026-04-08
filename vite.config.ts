import { defineConfig } from 'vite'

export default defineConfig({
  base: '/AI-assisted/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})