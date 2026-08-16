import { Router } from 'express';
import { getLinkStats, resolveLink, shortenLink } from '../controllers/linkController';
import { optionalAuth } from '../middleware/auth';
import { shortenLimiter } from '../middleware/rateLimit';

export const linkRouter = Router();

// Misafirler de kısaltabilir; giriş yapılmışsa link kullanıcıya bağlanır.
linkRouter.post('/shorten', shortenLimiter, optionalAuth, shortenLink);
// `/stats/:slug` önce tanımlanmalı, aksi hâlde `/:slug` onu yakalar.
linkRouter.get('/stats/:slug', getLinkStats);
linkRouter.get('/:slug', resolveLink);
