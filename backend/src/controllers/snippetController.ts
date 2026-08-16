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

type MediaType = 'video' | 'image' | 'live' | 'none';

/**
 * Gösterim ortamını belirler.
 *
 * Frontend snippet'leri ürün kuralı gereği her zaman canlı çalıştırılır — katkıcının
 * seçimi bu kategoride yok sayılır. Backend ve hacking için seçim katkıcıya aittir;
 * seçim yapılmamışsa hangi bağlantının verildiğine bakılır.
 */
function resolveMediaType(data: {
  category: string;
  mediaType?: MediaType;
  videoUrl?: string;
  imageUrl?: string;
}): MediaType {
  if (data.category === 'frontend') return 'live';
  if (data.mediaType && data.mediaType !== 'live') return data.mediaType;

  if (data.videoUrl) return 'video';
  if (data.imageUrl) return 'image';
  return 'none';
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
          // Frontend kartları kodu iframe içinde canlı gösterdiği için
          // liste yanıtı kod içeriğini de taşır.
          codeContent: true,
          demoHtml: true,
          mediaType: true,
          videoUrl: true,
          videoDurationSeconds: true,
          imageUrl: true,
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

export async function getSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    // Statü filtresi sorguda değil, sonrasında uygulanıyor: sahibinin kendi
    // onay bekleyen snippet'ini görebilmesi gerekiyor. Aksi hâlde katkıcı
    // gönderdiği şeyi hiçbir yerde göremiyordu.
    const snippet = await prisma.snippet.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id },
        ],
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

    // Yayınlanmamış snippet yalnızca sahibine ve yöneticiye görünür. Başkasına
    // 403 yerine 404 dönüyoruz: 403, var olmayan bir kaydın varlığını doğrular.
    const isOwner = req.user?.id === snippet.createdBy;
    const isAdmin = req.user?.role === 'admin';
    if (snippet.status !== 'approved' && !isOwner && !isAdmin) {
      res.status(404).json({ error: 'Snippet not found' });
      return;
    }

    // Increment view count (fire and forget)
    // Sahibinin kendi sayfasını açması görüntülenme sayılmaz — yoksa katkıcı
    // kendi snippet'ini kontrol ettikçe sayaç şişer.
    if (!isOwner) {
      prisma.snippet.update({
        where: { id: snippet.id },
        data: { viewsCount: { increment: 1 } },
      }).catch(() => {});
    }

    res.json({ snippet });
  } catch (error) {
    next(error);
  }
}

/**
 * Gönderim doğrudan yayımlansın mı, yoksa moderasyon kuyruğuna mı girsin?
 *
 * - **Yönetici**: her zaman doğrudan yayımlar.
 * - **Katkıcı**: frontend/backend içeriğini doğrudan yayımlar.
 * - **Hacking kategorisi**: katkıcı bile olsa incelemeye girer. Platformun açık
 *   politikası "her hacking gönderimi yayından önce incelenir" — kendi kuralımızı
 *   rol yüzünden delmeyelim.
 * - **Diğer herkes**: incelemeye girer.
 */
function autoApproves(role: string, category: string): boolean {
  if (role === 'admin') return true;
  if (category === 'hacking') return false;
  return role === 'contributor';
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
        demoHtml: data.demoHtml || null,
        category: data.category,
        difficulty: data.difficulty,
        tags: data.tags,
        mediaType: resolveMediaType(data),
        videoUrl: data.videoUrl || null,
        videoSource: data.videoSource,
        videoDurationSeconds: data.videoDurationSeconds,
        imageUrl: data.imageUrl || null,
        imageCaption: data.imageCaption || null,
        documentationUrl: data.documentationUrl || null,
        prerequisites: data.prerequisites,
        isExecutable: data.isExecutable,
        canDownload: data.canDownload,
        createdBy: req.user.id,
        status: autoApproves(req.user.role, data.category) ? 'approved' : 'pending',
        publishedAt: autoApproves(req.user.role, data.category) ? new Date() : null,
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

    // Kategori ya da medya alanları değiştiyse gösterim ortamını yeniden çöz;
    // örneğin backend'den frontend'e taşınan snippet canlı önizlemeye geçmeli.
    updateData.mediaType = resolveMediaType({
      category: data.category ?? existing.category,
      mediaType: data.mediaType,
      videoUrl: data.videoUrl ?? existing.videoUrl ?? undefined,
      imageUrl: data.imageUrl ?? existing.imageUrl ?? undefined,
    });

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
