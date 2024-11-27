import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Membuat Vite mendengarkan pada semua alamat IP
    port: 3000,        // Tentukan port jika perlu, default adalah 3000
    strictPort: true, 
  }
})
