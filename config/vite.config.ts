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
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: path.resolve(__dirname, 'tailwind.config.js'),
          }),
          autoprefixer(),
        ],
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'mask-icon.svg',
          'icons/*.png',
        ],
        manifest: {
          name: 'DLUT GPA Calculator',
          short_name: 'DLUT GPA',
          description: 'GPA Calculator for Dalian University of Technology',
          // 默认主题是 dark，启动画面用深色底才不会闪白
          theme_color: '#0f172a',
          background_color: '#0f172a',
          icons: [
            {
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: path.resolve(__dirname, '../src/test/setup.ts'),
      // 默认 5s。当前最慢的单例约 1.5s，但 2026-11-07 观察到一次高负载下
      // transform 从 3s 涨到 20s、整轮 47s 的超时失败（随后 6 次未复现）。
      // 放宽到 10s 吸收机器负载抖动；真卡死的用例仍会失败，不用 retry 掩盖。
      testTimeout: 10000,
      coverage: {
        // 覆盖率报告默认相对 root 解析，而 root 指向 ../src，会把报告写进 src/coverage/
        // 污染源码树。这里显式指到仓库根的 coverage/（已被 .gitignore 忽略）。
        reportsDirectory: path.resolve(__dirname, '../coverage'),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
      },
    },
  };
});
