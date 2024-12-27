import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        editor: './src/pages/editor.html',
        dashboard: './src/pages/dashboard.html',
        presenter: './src/pages/presenter.html',
      },
    },
  },
})
