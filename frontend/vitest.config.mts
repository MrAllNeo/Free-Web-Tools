import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    // Test edilen her şey saf mantık: DOM'a değil, Node'un kendi crypto/TextEncoder
    // API'lerine dayanıyor. jsdom kurmak gereksiz yavaşlık olurdu.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
