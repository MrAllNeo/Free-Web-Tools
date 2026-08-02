import { Router } from 'express';
import {
  listSnippets,
  getSnippetStats,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from '../controllers/snippetController';
import { createComment, listComments } from '../controllers/commentController';
import {
  getMyInteraction,
  toggleLike,
  toggleSave,
} from '../controllers/interactionController';
import { requireAuth, requireRole } from '../middleware/auth';

export const snippetRouter = Router();

// Public routes
snippetRouter.get('/', listSnippets);
// `/stats` mutlaka `/:id`den önce tanımlanmalı, aksi hâlde id parametresi olarak yakalanır.
snippetRouter.get('/stats', getSnippetStats);
snippetRouter.get('/:id', getSnippet);
snippetRouter.get('/:id/comments', listComments);

// Authenticated routes
snippetRouter.post('/', requireAuth, requireRole('contributor', 'admin'), createSnippet);
snippetRouter.put('/:id', requireAuth, updateSnippet);
snippetRouter.delete('/:id', requireAuth, deleteSnippet);

snippetRouter.post('/:id/comments', requireAuth, createComment);
snippetRouter.get('/:id/interaction', requireAuth, getMyInteraction);
snippetRouter.post('/:id/like', requireAuth, toggleLike);
snippetRouter.post('/:id/save', requireAuth, toggleSave);
