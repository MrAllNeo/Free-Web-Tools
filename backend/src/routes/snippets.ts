import { Router } from 'express';
import {
  listSnippets,
  getSnippetStats,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getRelatedSnippets,
} from '../controllers/snippetController';
import { createComment, listComments } from '../controllers/commentController';
import {
  getMyInteraction,
  toggleLike,
  toggleSave,
} from '../controllers/interactionController';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimit';

export const snippetRouter = Router();

// Public routes
snippetRouter.get('/', listSnippets);
// `/stats` mutlaka `/:id`den önce tanımlanmalı, aksi hâlde id parametresi olarak yakalanır.
snippetRouter.get('/stats', getSnippetStats);
// optionalAuth: giriş yapmış kullanıcı kendi yayınlanmamış snippet'ini görebilsin.
snippetRouter.get('/:id', optionalAuth, getSnippet);
snippetRouter.get('/:id/comments', listComments);
snippetRouter.get('/:id/related', getRelatedSnippets);

// Authenticated routes
// Yazma uçlarında ayrıca içerik üretim sınırı var; beğeni/kaydetme gibi geri
// alınabilir ve ucuz işlemler genel tavana bırakıldı.
// Giriş yapan herkes gönderebilir; yayımlanıp yayımlanmayacağına `autoApproves`
// karar veriyor. Rol kapısı buradayken moderasyon kuyruğu hiç dolmuyordu:
// gönderebilen tek roller zaten otomatik onaylananlardı.
snippetRouter.post('/', writeLimiter, requireAuth, createSnippet);
snippetRouter.put('/:id', writeLimiter, requireAuth, updateSnippet);
snippetRouter.delete('/:id', requireAuth, deleteSnippet);

snippetRouter.post('/:id/comments', writeLimiter, requireAuth, createComment);
snippetRouter.get('/:id/interaction', requireAuth, getMyInteraction);
snippetRouter.post('/:id/like', requireAuth, toggleLike);
snippetRouter.post('/:id/save', requireAuth, toggleSave);
