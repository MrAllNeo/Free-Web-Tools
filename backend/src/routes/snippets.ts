import { Router } from 'express';
import {
  listSnippets,
  getSnippetStats,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from '../controllers/snippetController';
import { requireAuth, requireRole } from '../middleware/auth';

export const snippetRouter = Router();

// Public routes
snippetRouter.get('/', listSnippets);
// `/stats` mutlaka `/:id`den önce tanımlanmalı, aksi hâlde id parametresi olarak yakalanır.
snippetRouter.get('/stats', getSnippetStats);
snippetRouter.get('/:id', getSnippet);

// Authenticated routes
snippetRouter.post('/', requireAuth, requireRole('contributor', 'admin'), createSnippet);
snippetRouter.put('/:id', requireAuth, updateSnippet);
snippetRouter.delete('/:id', requireAuth, deleteSnippet);
