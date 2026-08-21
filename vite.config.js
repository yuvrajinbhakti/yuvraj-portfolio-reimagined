import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      output: {
        // Only libraries that are genuinely on the entry path are listed here —
        // naming a chunk in this object makes Rollup wire it into the entry's
        // static graph, so listing three here would get it preloaded on every
        // page even though it is reached exclusively through lazy(). Left
        // unlisted, Rollup emits it as its own chunk behind the dynamic import.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'gsap-vendor': ['gsap'],
        },
      },
    },
  },
})
