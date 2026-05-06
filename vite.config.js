import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin', '**/*.glsl'],
  server: {
    port: 3005,
    host: true,
    open: true,
    proxy: {
      // Geocodificación → Nominatim (OpenStreetMap)
      '/api/geocode': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost')
            const params = new URLSearchParams(url.search)
            params.set('format', 'json')
            params.set('addressdetails', '1')
            proxyReq.path = '/search?' + params.toString()
            proxyReq.setHeader('User-Agent', 'Apacheta/1.0 (francoaltavista@gmail.com)')
            proxyReq.setHeader('Accept-Language', 'es')
            proxyReq.setHeader('Accept', 'application/json')
          })
        }
      },
      // Efemérides Swiss → astro.com/cgi/swetest.cgi
      '/api/chart': {
        target: 'https://www.astro.com',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost')
            proxyReq.path = '/cgi/swetest.cgi' + url.search
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; Apacheta/1.0; francoaltavista@gmail.com)')
            proxyReq.setHeader('Accept', 'text/plain, */*')
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
