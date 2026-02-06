import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Generate source maps for debugging (optional in production)
    sourcemap: false,

    // Minify using esbuild (faster) or terser (smaller)
    minify: 'esbuild',

    // Target modern browsers for smaller bundle
    target: 'es2020',

    // Chunk splitting strategy
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React
          'vendor-react': ['react', 'react-dom'],
          // Vendor chunk for crypto/hash libraries
          'vendor-crypto': ['crypto-js', 'uuid'],
          // Vendor chunk for text processing
          'vendor-text': ['diff', 'change-case', 'marked'],
        },
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 500,
  },

  // Preview server config
  preview: {
    port: 4173,
    open: true,
  },

  // Dev server config
  server: {
    port: 5173,
    open: true,
  },
})
