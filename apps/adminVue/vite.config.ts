import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({ rollupTypes: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.vue', '.ts', '.js', '.jsx', '.tsx', '.json'],
  },
  server: {
    headers: {
      'access-control-allow-origin': '*',
    },
    host: '0.0.0.0',
    proxy: {
      '/micro-assets/': 'http://192.168.5.199',
      '/api/': 'http://192.168.5.199',
    },
  },
});
