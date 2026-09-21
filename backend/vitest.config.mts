import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // env.ts veritabanı adresini her ortamda zorunlu tutar; birim testleri gerçek
    // veritabanına bağlanmaz ama modüller yüklenirken geçerli bir adres gerekir.
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/fwt_test',
    },
  },
});
