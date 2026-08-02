import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createSnippetSchema, updateSnippetSchema, snippetQuerySchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

async function generateUniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let counter = 0;
  let candidateSlug = slug;

  while (true) {
    const existing = await prisma.snippet.findUnique({ where: { slug: candidateSlug } });
    if (!existing) return candidateSlug;
    counter++;
    candidateSlug = `${slug}-${counter}`;
  }
}

export async function listSnippets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = snippetQuerySchema.parse(req.query);
    const { page, limit, category, language, difficulty, search, sort } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'approved',
    };

    if (category) where.category = category;
    if (language) where.codeLanguage = language;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { viewsCount: 'desc' };
    if (sort === 'top-rated') orderBy = { averageRating: 'desc' };

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.snippet.count({ where }),
    ]);

    res.json({
      snippets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Ana sayfa özet sayaçları: toplam snippet, kategori kırılımı ve ortalama puan.
 * Tek istekte döner, böylece kategori kartları için ayrı ayrı sorgu atılmaz.
 */
export async function getSnippetStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const where = { status: 'approved' as const };

    const [total, grouped, aggregate] = await Promise.all([
      prisma.snippet.count({ where }),
      prisma.snippet.groupBy({ by: ['category'], where, _count: { _all: true } }),
      // Puanlanmamış snippet'ler ortalamayı aşağı çekmesin diye 0 puanlılar hariç tutulur.
      prisma.snippet.aggregate({
        where: { ...where, averageRating: { gt: 0 } },
        _avg: { averageRating: true },
      }),
    ]);

    const byCategory = Object.fromEntries(
      grouped.map((row) => [row.category, row._count._all])
    ) as Record<string, number>;

    const average = aggregate._avg.averageRating;

    res.json({
      total,
      byCategory,
      averageRating: average === null ? null : Math.round(average * 10) / 10,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSnippet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const snippet = await prisma.snippet.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id },
        ],
        status: 'approved',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            reputationScore: true,
          },
        },
        comments: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!snippet) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    // Increment view count (fire and forget)
    prisma.snippet.update({
      where: { id: snippet.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    res.json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function createSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const data = createSnippetSchema.parse(req.body);
    const slug = await generateUniqueSlug(data.title);

    const snippet = await prisma.snippet.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        codeContent: data.codeContent,
        codeLanguage: data.codeLanguage,
        category: data.category,
        difficulty: data.difficulty,
        tags: data.tags,
        videoUrl: data.videoUrl || null,
        videoSource: data.videoSource,
        videoDurationSeconds: data.videoDurationSeconds,
        documentationUrl: data.documentationUrl || null,
        prerequisites: data.prerequisites,
        isExecutable: data.isExecutable,
        canDownload: data.canDownload,
        createdBy: req.user.id,
        // Auto-approve for admins and contributors
        status: ['admin', 'contributor'].includes(req.user.role) ? 'approved' : 'pending',
        publishedAt: ['admin', 'contributor'].includes(req.user.role) ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function updateSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;
    const data = updateSnippetSchema.parse(req.body);

    // Check ownership
    const existing = await prisma.snippet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    if (existing.createdBy !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You can only edit your own snippets' });
      return;
    }

    // Regenerate slug if title changed
    const updateData: any = { ...data };
    if (data.title && data.title !== existing.title) {
      updateData.slug = await generateUniqueSlug(data.title);
    }

    const snippet = await prisma.snippet.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function deleteSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;

    const existing = await prisma.snippet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    if (existing.createdBy !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You can only delete your own snippets' });
      return;
    }

    await prisma.snippet.delete({ where: { id } });

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    next(error);
  }
}
