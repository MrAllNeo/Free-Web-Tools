import { Router } from 'express';
import { createReport } from '../controllers/reportController';
import { requireAuth } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimit';

export const reportRouter = Router();

// Bildirim de bir yazma işlemi; kuyruğu doldurmaya karşı aynı sınıra tabi.
reportRouter.post('/', writeLimiter, requireAuth, createReport);
