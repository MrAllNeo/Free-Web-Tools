import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

type ToggleAction = 'like' | 'save';

/**
 * Beğeni ve kaydetme aynı mantığı paylaşır: kayıt varsa kaldır, yoksa ekle.
 * `user_interactions` üzerindeki (user, snippet, action) benzersiz kısıtı
 * çift kayıt oluşmasını veritabanı seviyesinde de engeller.
 */
async function toggle(
  req: AuthRequest,
  res: Response,
  action: ToggleAction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const snippetId = req.params.id as string;
  const userId = req.user.id;

  const snippet = await prisma.snippet.findFirst({
    where: { id: snippetId, status: 'approved' },
    select: { id: true },
  });

  if (!snippet) {
    res.status(404).json({ error: 'Snippet not found' });
    return;
  }

  const existing = await prisma.userInteraction.findUnique({
    where: { userId_snippetId_action: { userId, snippetId, action } },
    select: { id: true },
  });

  const active = !existing;

  if (existing) {
    await prisma.userInteraction.delete({ where: { id: existing.id } });
  } else {
    await prisma.userInteraction.create({ data: { userId, snippetId, action } });
  }

  // Beğeni sayacı snippet üzerinde denormalize tutuluyor; liste sorgularında
  // her seferinde COUNT atmamak için.
  if (action === 'like') {
    const likesCount = await prisma.userInteraction.count({
      where: { snippetId, action: 'like' },
    });
    await prisma.snippet.update({ where: { id: snippetId }, data: { likesCount } });
    res.json({ active, likesCount });
    return;
  }

  res.json({ active });
}

export async function toggleLike(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await toggle(req, res, 'like');
  } catch (error) {
    next(error);
  }
}

export async function toggleSave(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await toggle(req, res, 'save');
  } catch (error) {
    next(error);
  }
}

/** Detay sayfasının butonları doğru durumda açması için mevcut kullanıcının etkileşimleri. */
export async function getMyInteraction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const snippetId = req.params.id as string;

    const interactions = await prisma.userInteraction.findMany({
      where: { userId: req.user.id, snippetId, action: { in: ['like', 'save'] } },
      select: { action: true },
    });

    const actions = new Set(interactions.map((i) => i.action));

    res.json({ liked: actions.has('like'), saved: actions.has('save') });
  } catch (error) {
    next(error);
  }
}

/** Kullanıcının kaydettiği snippet'ler (profil sayfası için). */
export async function listSaved(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const interactions = await prisma.userInteraction.findMany({
      where: { userId: req.user.id, action: 'save' },
      orderBy: { createdAt: 'desc' },
      select: {
        snippet: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            codeLanguage: true,
            category: true,
            difficulty: true,
            tags: true,
            videoUrl: true,
            videoDurationSeconds: true,
            viewsCount: true,
            likesCount: true,
            commentsCount: true,
            averageRating: true,
            createdAt: true,
            author: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    res.json({ snippets: interactions.map((i) => i.snippet) });
  } catch (error) {
    next(error);
  }
}
