import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindConfig from './tailwind.config'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

  ],
})
