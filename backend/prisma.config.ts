import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `prisma generate` veritabanına hiç bağlanmaz, ama bu dosya HER prisma
 * komutunda okunuyor ve `env("DATABASE_URL")` değeri anında çözmeye çalışıyordu.
 * Sonuç: .env'in bulunmadığı her ortamda — Docker imaj derlemesi, CI, temiz bir
 * klonda kurulum — generate adımı "Cannot resolve environment variable: DATABASE_URL"
 * diyerek patlıyor, ardından `tsc` üretilmemiş Prisma istemcisi yüzünden çöküyordu.
 * Yani proje, .env'i olmayan bir makinede derlenemiyordu.
 *
 * Değer artık isteğe bağlı okunuyor. Gerçekten bağlantı gerektiren komutlar
 * (migrate, db push, studio) yer tutucuya ulaşamayıp hata verir; yer tutucunun
 * içindeki metin de o hatanın nedenini doğrudan günlüğe yazar.
 */
const PLACEHOLDER = "postgresql://unset:unset@localhost:5432/DATABASE_URL_TANIMLI_DEGIL?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? PLACEHOLDER,
  },
});
