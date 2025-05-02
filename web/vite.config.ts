import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        setup: './src/setup.html',
        editor: './src/editor.html',
        dashboard: './src/dashboard.html',
        presenter: './src/presenter.html',
      },
    },
  },
})
