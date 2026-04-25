import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.glsl'],
  server: {
    port: 3005,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'https://apacheta-nine.vercel.app',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
