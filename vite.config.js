import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/main.js',
      formats: ['es'],
      fileName: 'promptcraft-vue',
    },
    outDir: 'js',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        '../../../scripts/app.js',
        '../../../scripts/api.js',
      ],
      output: {
        paths: {
          '../../../scripts/app.js': '../../../scripts/app.js',
          '../../../scripts/api.js': '../../../scripts/api.js',
        },
      },
    },
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
  },
})
