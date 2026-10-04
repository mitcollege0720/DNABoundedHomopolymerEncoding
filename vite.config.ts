import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createBheApiPlugin } from './vite-plugin-bhe-api'

export default defineConfig({
  plugins: [react(), createBheApiPlugin()],
})
