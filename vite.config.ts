import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig((config) => {
  const { mode } = config
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || ''

  return {
    plugins: [vue()],
    base: basePath,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('vue') ||
              id.includes('vue-router') ||
              id.includes('pinia') ||
              id.includes('vue-i18n')
            ) {
              return 'vue-vendor'
            }

            if (id.includes('gsap')) {
              return 'anim-vendor'
            }
          },
        },
      },
    },
    server: {
      host: true,
    },
  }
})
