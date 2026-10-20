import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://heytonyy.github.io/ml-with-pokemon/
  base: '/ml-with-pokemon/',
  plugins: [tailwindcss(),react()],
})
