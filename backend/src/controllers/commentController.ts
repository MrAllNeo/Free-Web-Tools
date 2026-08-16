import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createCommentSchema, updateCommentSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';
import { notifyCommentOnSnippet, notifyReplyToComment } from '../services/notifications';

const COMMENT_AUTHOR = { id: true, username: true, avatarUrl: true } as const;

/**
 * Bir snippet'in ortalama puanını yeniden hesaplayıp yazar.
 * Yorum ekleme/silme sonrası çağrılır.
 */
async function recalculateRating(snippetId: string): Promise<void> {
  const [aggregate, count] = await Promise.all([
    prisma.comment.aggregate({
      where: { snippetId, status: 'approved', rating: { not: null } },
      _avg: { rating: true },
    }),
    prisma.comment.count({ where: { snippetId, status: 'approved' } }),
  ]);

  await prisma.snippet.update({
    where: { id: snippetId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      commentsCount: count,
    },
  });
}

export async function listComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const snippetId = req.params.id as string;

    const comments = await prisma.comment.findMany({
      // Yanıtlar üst yorumun içinde döndüğü için kök seviyeyi filtreliyoruz.
      where: { snippetId, status: 'approved', parentCommentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: COMMENT_AUTHOR },
        replies: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'asc' },
          include: { user: { select: COMMENT_AUTHOR } },
        },
      },
    });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
}

export async function createComment(
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
    const data = createCommentSchema.parse(req.body);

    const snippet = await prisma.snippet.findFirst({
      where: { id: snippetId, status: 'approved' },
      select: { id: true, createdBy: true },
    });

    if (!snippet) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    // Yanıt veriliyorsa üst yorumun aynı snippet'e ait olduğunu doğrula —
    // aksi hâlde başka bir snippet'in yorumuna iliştirilebilir.
    let parentAuthorId: string | null = null;
    if (data.parentCommentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: data.parentCommentId, snippetId },
        select: { id: true, userId: true },
      });

      if (!parent) {
        res.status(400).json({ error: 'Parent comment does not belong to this snippet' });
        return;
      }
      parentAuthorId = parent.userId;
    }

    const comment = await prisma.comment.create({
      data: {
        snippetId,
        userId: req.user.id,
        content: data.content,
        rating: data.rating ?? null,
        parentCommentId: data.parentCommentId ?? null,
      },
      include: { user: { select: COMMENT_AUTHOR } },
    });

    await recalculateRating(snippetId);

    // Bildirimler yorumun kaydedilmesinden sonra; hata verseler bile yorum durur.
    // Yanıt veriliyorsa üst yorumun sahibine, değilse snippet sahibine gider —
    // ikisi de aynı kişiyse tek bildirim yeter.
    if (parentAuthorId) {
      await notifyReplyToComment({
        parentAuthorId,
        actorId: req.user.id,
        snippetId,
        commentId: comment.id,
      });
    }
    if (snippet.createdBy !== parentAuthorId) {
      await notifyCommentOnSnippet({
        snippetOwnerId: snippet.createdBy,
        actorId: req.user.id,
        snippetId,
        commentId: comment.id,
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

/**
 * Yorum metnini düzenler.
 *
 * Puan bilinçli olarak değiştirilemez: puan snippet'in ortalamasını besliyor ve
 * yorum üzerinden sessizce oynanabilmesi ortalamayı manipüle etmenin kolay yolu
 * olurdu. Puanını değiştirmek isteyen yorumu silip yeniden yazar.
 */
export async function updateComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;
    const data = updateCommentSchema.parse(req.body);

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Yönetici başkasının yorumunu silebilir ama yazamaz: birinin ağzından
    // söz değiştirmek moderasyon değil, tahrifat olurdu.
    if (existing.userId !== req.user.id) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: data.content },
      include: { user: { select: COMMENT_AUTHOR } },
    });

    res.json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, userId: true, snippetId: true },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    await prisma.comment.delete({ where: { id } });
    await recalculateRating(comment.snippetId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
