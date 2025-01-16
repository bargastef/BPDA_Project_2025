import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfillPlugin from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      path: 'path-browserify',
      stream: 'stream-browserify',
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
