import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Kullanıcının bildirimleri. Sayfalama yok — en yeni 50 kayıt yeterli;
 * bildirim listesi arşiv değil, "ne kaçırdım" ekranı.
 */
export async function listNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          type: true,
          readAt: true,
          createdAt: true,
          actor: { select: { username: true, avatarUrl: true } },
          snippet: { select: { title: true, slug: true } },
        },
      }),
      prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

/** Tümünü okundu işaretler. Tek tek işaretlemek bu ölçekte gereksiz karmaşa. */
export async function markAllRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ marked: result.count });
  } catch (error) {
    next(error);
  }
}
