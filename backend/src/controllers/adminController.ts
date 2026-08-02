import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { moderateSnippetSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export async function listPendingSnippets(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const snippets = await prisma.snippet.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' }, // en eski bekleyen önce
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        codeContent: true,
        codeLanguage: true,
        category: true,
        difficulty: true,
        tags: true,
        videoUrl: true,
        documentationUrl: true,
        createdAt: true,
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.json({ snippets });
  } catch (error) {
    next(error);
  }
}

export async function moderateSnippet(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, rejectionReason } = moderateSnippetSchema.parse(req.body);

    const existing = await prisma.snippet.findUnique({
      where: { id },
      select: { id: true, createdBy: true, publishedAt: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    const snippet = await prisma.snippet.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? (rejectionReason ?? null) : null,
        // Yayın tarihi yalnızca ilk onayda yazılır; sonraki onaylarda korunur.
        publishedAt:
          status === 'approved' ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
      select: { id: true, slug: true, status: true, publishedAt: true },
    });

    // Katkı geçmişi kim neyi ne zaman inceledi sorusunu yanıtlar.
    await prisma.contributionHistory.create({
      data: {
        userId: req.user!.id,
        snippetId: id,
        action: 'reviewed',
        details: { status, rejectionReason: rejectionReason ?? null },
      },
    });

    // Onaylanan snippet katkıcıya itibar puanı kazandırır.
    if (status === 'approved') {
      await prisma.user.update({
        where: { id: existing.createdBy },
        data: { reputationScore: { increment: 10 } },
      });
    }

    res.json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [users, snippetsByStatus, comments, shortLinks, topSnippets] = await Promise.all([
      prisma.user.count(),
      prisma.snippet.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.comment.count(),
      prisma.shortLink.count(),
      prisma.snippet.findMany({
        where: { status: 'approved' },
        orderBy: { viewsCount: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, viewsCount: true, averageRating: true },
      }),
    ]);

    res.json({
      users,
      comments,
      shortLinks,
      snippets: Object.fromEntries(
        snippetsByStatus.map((row) => [row.status, row._count._all])
      ),
      topSnippets,
    });
  } catch (error) {
    next(error);
  }
}
