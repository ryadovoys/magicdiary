import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The API proxy has been removed as we'll now use a popup for API key entry
});