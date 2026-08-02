import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';
import { prisma } from '../lib/prisma';
import { shortenUrlSchema } from '../utils/validators';
import { checkUrl } from '../utils/urlSafety';
import { AuthRequest } from '../middleware/auth';

/**
 * Karışması kolay karakterler (0/O, 1/l/I) bilinçli olarak çıkarıldı —
 * kısa linkler sık sık elle yazılıyor ya da telefonla okunuyor.
 */
const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SLUG_LENGTH = 7;
const MAX_ATTEMPTS = 5;

function randomSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = '';
  for (const byte of bytes) slug += ALPHABET[byte % ALPHABET.length];
  return slug;
}

export async function shortenLink(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url, expiresInDays } = shortenUrlSchema.parse(req.body);

    const check = checkUrl(url, req.hostname);
    if (!check.ok) {
      res.status(400).json({ error: check.reason });
      return;
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Çakışma olasılığı çok düşük ama sıfır değil; benzersiz kısıt hatasında yeniden dene.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const link = await prisma.shortLink.create({
          data: {
            originalUrl: check.url,
            slug: randomSlug(),
            userId: req.user?.id ?? null,
            expiresAt,
          },
          select: { slug: true, originalUrl: true, createdAt: true, expiresAt: true },
        });

        res.status(201).json({ link });
        return;
      } catch (error) {
        const isUniqueViolation =
          typeof error === 'object' &&
          error !== null &&
          (error as { code?: string }).code === 'P2002';

        if (!isUniqueViolation) throw error;
      }
    }

    res.status(503).json({ error: 'Benzersiz kısa kod üretilemedi, tekrar deneyin' });
  } catch (error) {
    next(error);
  }
}

/**
 * Kısa linki çözer ve tıklanma sayacını artırır.
 * Yönlendirmenin kendisi frontend tarafında yapılır; burada yalnızca hedef döner.
 */
export async function resolveLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug as string;

    const link = await prisma.shortLink.findUnique({
      where: { slug },
      select: { id: true, originalUrl: true, expiresAt: true, clickCount: true },
    });

    if (!link) {
      res.status(404).json({ error: 'Kısa link bulunamadı' });
      return;
    }

    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      res.status(410).json({ error: 'Bu kısa linkin süresi dolmuş' });
      return;
    }

    // Sayaç isteği yanıtı bekletmesin; hata olursa yönlendirme yine de çalışır.
    prisma.shortLink
      .update({ where: { id: link.id }, data: { clickCount: { increment: 1 } } })
      .catch(() => undefined);

    res.json({ url: link.originalUrl, clickCount: link.clickCount + 1 });
  } catch (error) {
    next(error);
  }
}

export async function getLinkStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug as string;

    const link = await prisma.shortLink.findUnique({
      where: { slug },
      select: {
        slug: true,
        originalUrl: true,
        clickCount: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!link) {
      res.status(404).json({ error: 'Kısa link bulunamadı' });
      return;
    }

    res.json({ link });
  } catch (error) {
    next(error);
  }
}
