import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
    'process': JSON.stringify({ env: { NODE_ENV: 'production' } }),
  },
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
        '../../../../scripts/app.js',
        '../../../../scripts/api.js',
      ],
      output: {
        paths: {
          '../../../scripts/app.js': '../../../scripts/app.js',
          '../../../scripts/api.js': '../../../scripts/api.js',
          '../../../../scripts/app.js': '../../../../scripts/app.js',
          '../../../../scripts/api.js': '../../../../scripts/api.js',
        },
      },
    },
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
  },
})
