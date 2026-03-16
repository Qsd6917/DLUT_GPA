/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, '../src'),
    envDir: path.resolve(__dirname, '..'),
    publicDir: path.resolve(__dirname, '../public'),
    build: {
      outDir: path.resolve(__dirname, '../dist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'icon-vendor': ['lucide-react'],
            'motion-vendor': ['framer-motion'],
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: path.resolve(__dirname, 'tailwind.config.js') }),
          autoprefixer(),
        ],
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'icons/*.png'],
        manifest: {
          name: 'DLUT GPA Calculator',
          short_name: 'DLUT GPA',
          description: 'GPA Calculator for Dalian University of Technology',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: path.resolve(__dirname, '../src/test/setup.ts'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
      },
    },
  };
});
