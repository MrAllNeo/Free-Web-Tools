import { Router } from 'express';
import { listNotifications, markAllRead } from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', listNotifications);
notificationRouter.put('/read', markAllRead);
