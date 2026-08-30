import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Live site is nested under the personal site.
// Override with BASE_PATH=/ for root hosting if needed.
const base = process.env.BASE_PATH || '/regex-generator/'

export default defineConfig({
  base,
  plugins: [vue(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
