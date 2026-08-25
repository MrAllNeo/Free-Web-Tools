# ─── Free Web Tools — Backend imajı ───────────────────────────────────────────
#
# Docker zorunlu değil: düz bir VPS'te systemd ile de çalıştırabilirsin (DEPLOY.md).
# Bu dosya Render, Fly.io, Coolify, Dokploy gibi imaj bekleyen ortamlar için.
#
# Derleme:  docker build -t fwt-backend ./backend
# Çalıştır: docker run -p 3001:3001 --env-file backend/.env fwt-backend

# ─── 1. Derleme katmanı ───────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Prisma'nın sorgu motoru OpenSSL'e bağlı; slim imajda ayrıca kurulması gerekir.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Şema ve prisma yapılandırması bağımlılıklardan ÖNCE kopyalanmalı: `npm ci`
# sırasında çalışan `postinstall` betiği `prisma generate` çağırıyor ve bu ikisine
# ihtiyaç duyuyor. (DATABASE_URL'e ihtiyaç duymuyor — bkz. prisma.config.ts.)
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── 2. Çalışma katmanı ───────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

# node_modules bilinçli olarak olduğu gibi taşınıyor, geliştirme bağımlılıkları
# ayıklanmıyor. İki nedeni var: `prisma generate` çıktısı node_modules içine
# yazılıyor ve bir budama adımı onu sessizce silebiliyor; ayrıca prisma CLI'ın
# imajda kalması, `docker run ... npx prisma migrate deploy` ile göçleri
# konteynerin içinden çalıştırabilmeni sağlıyor. Bedeli birkaç yüz MB.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
# Göçleri konteyner içinden çalıştırabilmek için şema ve migration dosyaları da lazım.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Kök kullanıcı olarak çalışmaya gerek yok.
USER node

EXPOSE 3001

# Slim imajda curl yok; sağlık kontrolünü Node'un kendi fetch'iyle yapıyoruz.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
