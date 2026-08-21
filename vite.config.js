import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Puerto fijo: con varios proyectos locales corriendo Vite a la vez, sin
  // esto cada uno puede terminar en un puerto distinto (5173, 5174, ...) y
  // romper el CORS del backend, que solo permite el origen configurado en
  // FRONTEND_URL. strictPort falla fuerte en vez de saltar a otro puerto en
  // silencio, así el problema se nota enseguida y no como un CORS misterioso.
  server: {
    port: 5190,
    strictPort: true,
  },
})
