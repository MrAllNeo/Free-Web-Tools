import { Router } from 'express';
import { getPublicProfile, listMySnippets, updateMe } from '../controllers/userController';
import { listSaved } from '../controllers/interactionController';
import { deleteComment } from '../controllers/commentController';
import { requireAuth } from '../middleware/auth';

export const userRouter = Router();

userRouter.put('/me', requireAuth, updateMe);
userRouter.get('/me/saved', requireAuth, listSaved);
userRouter.get('/me/snippets', requireAuth, listMySnippets);

// Yorum silme snippet'ten bağımsız çalışır; sahibi ya da yönetici silebilir.
userRouter.delete('/comments/:id', requireAuth, deleteComment);

// Dinamik segment en sonda: yukarıdaki sabit yolları yutmasın.
userRouter.get('/:username', getPublicProfile);
