import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.glsl'],
  server: {
    port: 3005,
    host: true,   // ← expone en LAN: accesible desde el celu vía IP local
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
