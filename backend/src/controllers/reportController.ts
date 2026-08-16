import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createReportSchema, resolveReportSchema } from '../utils/validators';

/**
 * İçerik bildirme.
 *
 * Moderasyon yalnızca yayın öncesi çalışıyordu; yayımlandıktan sonra kötüye
 * kullanımı yakalamanın başka yolu yoktu. Bildirim için giriş şart: anonim
 * bildirim, moderasyon kuyruğunu doldurmak için bedava bir araç olurdu.
 */
export async function createReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const data = createReportSchema.parse(req.body);

    if (!data.snippetId && !data.commentId) {
      res.status(400).json({ error: 'Either snippetId or commentId is required' });
      return;
    }

    // Bildirilen şeyin var olduğunu doğrula; yoksa kuyruk hayalet kayıtla dolar.
    if (data.snippetId) {
      const exists = await prisma.snippet.findUnique({
        where: { id: data.snippetId },
        select: { id: true },
      });
      if (!exists) {
        res.status(404).json({ error: 'Snippet not found' });
        return;
      }
    }
    if (data.commentId) {
      const exists = await prisma.comment.findUnique({
        where: { id: data.commentId },
        select: { id: true },
      });
      if (!exists) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
    }

    // Aynı kişinin aynı içeriği tekrar tekrar bildirmesi kuyruğu şişirir;
    // açık bir bildirimi varsa sessizce onu döndürüyoruz.
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: req.user.id,
        status: 'open',
        snippetId: data.snippetId ?? null,
        commentId: data.commentId ?? null,
      },
    });

    if (existing) {
      res.status(200).json({ report: existing, alreadyReported: true });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        snippetId: data.snippetId ?? null,
        commentId: data.commentId ?? null,
        reason: data.reason,
        details: data.details ?? null,
      },
    });

    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
}

/** Moderasyon kuyruğu: açık bildirimler, bildirilen içerikle birlikte. */
export async function listReports(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = (req.query.status as string) === 'all' ? undefined : 'open';

    const reports = await prisma.report.findMany({
      where: status ? { status: 'open' } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        reporter: { select: { username: true } },
        snippet: { select: { id: true, title: true, slug: true, category: true } },
        comment: {
          select: {
            id: true,
            content: true,
            snippet: { select: { title: true, slug: true } },
          },
        },
      },
    });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
}

/** Bildirimi kapatır. İçeriğe müdahale ayrı bir işlem — burada yalnızca kuyruk yönetimi var. */
export async function resolveReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = resolveReportSchema.parse(req.body);

    const existing = await prisma.report.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status, resolvedAt: new Date() },
    });

    res.json({ report });
  } catch (error) {
    next(error);
  }
}
