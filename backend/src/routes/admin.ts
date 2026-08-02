import { Router } from 'express';
import {
  getAnalytics,
  listPendingSnippets,
  moderateSnippet,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Tüm admin rotaları yönetici yetkisi ister.
adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/snippets/pending', listPendingSnippets);
adminRouter.put('/snippets/:id/status', moderateSnippet);
adminRouter.get('/analytics', getAnalytics);
