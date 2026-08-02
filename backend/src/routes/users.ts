import { Router } from 'express';
import { updateMe } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

export const userRouter = Router();

userRouter.put('/me', requireAuth, updateMe);
