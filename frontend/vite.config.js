import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // Where the app will be served from in production
  base: '/javascript/dist/',

  build: {
    // Output into your existing FastAPI static dir
    outDir: resolve(__dirname, '../javascript/dist'),
    emptyOutDir: true,

    // Make filenames stable (no hashes) so you can hard-code paths
    // in base.html. 
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
