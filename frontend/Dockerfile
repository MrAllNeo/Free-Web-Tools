# ─── Free Web Tools — Frontend imajı ──────────────────────────────────────────
#
# Derleme:  docker build -t fwt-frontend ./frontend \
#             --build-arg NEXT_PUBLIC_API_URL=https://example.com/api \
#             --build-arg NEXT_PUBLIC_SITE_URL=https://example.com
#
# NEXT_PUBLIC_* değerleri çalışma anında değil DERLEME anında pakete gömülür.
# Bu yüzden ortam değişkeni olarak değil build arg olarak veriliyorlar; alan
# adın değişirse imajı yeniden derlemen gerekir.

# ─── 1. Bağımlılıklar ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── 2. Derleme ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── 3. Çalışma ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone çıktısı kendi minimal node_modules'ünü içinde taşır; public/ ve
# static/ ayrıca kopyalanmalı çünkü standalone bunları dahil etmez.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
