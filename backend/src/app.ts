import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { snippetRouter } from './routes/snippets';
import { userRouter } from './routes/users';
import { linkRouter } from './routes/links';
import { adminRouter } from './routes/admin';
import { notificationRouter } from './routes/notifications';
import { reportRouter } from './routes/reports';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { logger } from './utils/logger';

const app = express();

/**
 * Ters vekil (nginx, Cloudflare, platform yönlendiricisi) arkasında çalışırken
 * gerçek istemci IP'si `X-Forwarded-For` başlığında gelir. Bu ayar açılmazsa
 * hız sınırlayıcı tüm ziyaretçileri tek bir IP sanar ve hepsini birlikte kısar.
 *
 * Varsayılan kapalı: vekil yokken bu başlığa güvenmek, istemcinin kendi IP'sini
 * uydurup sınırı aşmasına izin verirdi.
 */
if (env.TRUST_PROXY !== null) {
  app.set('trust proxy', env.TRUST_PROXY);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
// 10 MB gereğinden fazlaydı: en büyük gövde bile bir snippet'in kodu + demo
// markup'ı kadar. Küçük tutmak bellek tüketen isteklerin maliyetini düşürür.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Genel tavan. Sağlık kontrolü bilinçli olarak üstte kaldı: izleme uçları
// sınırlanırsa sistem sağlıklıyken sağlıksız görünür.
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/snippets', snippetRouter);
app.use('/api/users', userRouter);
app.use('/api/links', linkRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reports', reportRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

export default app;
