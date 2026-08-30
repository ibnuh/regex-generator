import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Live site is nested under the personal site.
// Override with BASE_PATH=/ for root hosting if needed.
const base = process.env.BASE_PATH || '/regex-generator/'

export default defineConfig({
  base,
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // Avoid jsesc's top-level Buffer.isBuffer (Node-only).
      jsesc: fileURLToPath(new URL('./src/shims/jsesc.js', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
