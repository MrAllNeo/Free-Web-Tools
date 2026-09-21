import { Router } from 'express';
import {
  analyzeMedia,
  cancelMediaDownload,
  createMediaDownload,
  getMediaDownload,
  getMediaEvents,
  streamMediaFile,
} from '../controllers/mediaController';
import { mediaAnalyzeLimiter, mediaMutationLimiter } from '../middleware/rateLimit';

export const mediaRouter = Router();

mediaRouter.post('/analyze', mediaAnalyzeLimiter, analyzeMedia);
mediaRouter.post('/downloads', mediaMutationLimiter, createMediaDownload);
mediaRouter.get('/downloads/:id/events', getMediaEvents);
mediaRouter.get('/downloads/:id/file', streamMediaFile);
mediaRouter.get('/downloads/:id', getMediaDownload);
mediaRouter.delete('/downloads/:id', mediaMutationLimiter, cancelMediaDownload);
