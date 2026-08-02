import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { updateProfileSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

/** Profil yanıtlarında hiçbir zaman passwordHash dönmemek için ortak seçim. */
const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  bio: true,
  role: true,
  reputationScore: true,
  profileVerified: true,
  avatarUrl: true,
  githubUrl: true,
  websiteUrl: true,
  createdAt: true,
  lastLogin: true,
  _count: { select: { snippets: true, comments: true } },
} as const;

export async function updateMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const data = updateProfileSchema.parse(req.body);

    // Boş metin gönderilen alanlar "temizle" anlamına gelir, null olarak yazılır.
    const normalize = (value: string | undefined) =>
      value === undefined ? undefined : value.trim() === '' ? null : value.trim();

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: normalize(data.fullName),
        bio: normalize(data.bio),
        avatarUrl: normalize(data.avatarUrl),
        githubUrl: normalize(data.githubUrl),
        websiteUrl: normalize(data.websiteUrl),
      },
      select: PUBLIC_USER_FIELDS,
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
