import { Request, Response, NextFunction } from 'express';
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

/**
 * Herkese açık profilde gösterilecek alanlar.
 *
 * `PUBLIC_USER_FIELDS`ten ayrı tutuluyor: orası kullanıcının **kendi** hesabı için
 * ve `email` ile `lastLogin` içeriyor. Bunları yabancılara açmak kişisel veri
 * sızıntısı olurdu — e-posta spam hedefi, son giriş ise çevrimiçi olma bilgisi.
 */
const PROFILE_FIELDS = {
  id: true,
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
} as const;

/**
 * Kullanıcı adına göre herkese açık profil: kullanıcı bilgisi + yayınlanmış
 * snippet'leri. Onay bekleyen ya da reddedilmiş snippet'ler burada görünmez.
 */
export async function getPublicProfile(
  // Express 5 params'ı `string | string[]` olarak tipliyor; generic ile daraltıyoruz.
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: PROFILE_FIELDS,
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [snippets, totalLikes] = await Promise.all([
      prisma.snippet.findMany({
        where: { createdBy: user.id, status: 'approved' },
        orderBy: { publishedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          codeLanguage: true,
          category: true,
          difficulty: true,
          tags: true,
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
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.snippet.aggregate({
        where: { createdBy: user.id, status: 'approved' },
        _sum: { likesCount: true, viewsCount: true },
      }),
    ]);

    res.json({
      user,
      snippets,
      stats: {
        snippets: snippets.length,
        likes: totalLikes._sum.likesCount ?? 0,
        views: totalLikes._sum.viewsCount ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Kullanıcının kendi snippet'leri — **her statüde**.
 *
 * Liste ve profil yalnızca `approved` gösterdiği için katkıcı gönderdiği snippet'i
 * hiçbir yerde göremiyordu: gönder, "onay bekleniyor" yazısını gör, sonra kaybolsun.
 * Burada onay bekleyenler ve reddedilenler gerekçesiyle birlikte dönüyor.
 */
export async function listMySnippets(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const snippets = await prisma.snippet.findMany({
      where: { createdBy: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        codeLanguage: true,
        category: true,
        difficulty: true,
        tags: true,
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
        // Sahibine özel: kendi içeriğinin nerede takıldığını görmeli.
        status: true,
        rejectionReason: true,
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.json({ snippets });
  } catch (error) {
    next(error);
  }
}

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
