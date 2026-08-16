import type { NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Site içi bildirimler.
 *
 * Bildirim üretmek, tetikleyen işlemin başarısını etkilememeli: yorum kaydedildiyse
 * yorum kaydedilmiştir, bildirim yazılamadı diye istek hata dönmemeli. Bu yüzden
 * hatalar yutuluyor ve yalnızca loglanıyor.
 */
async function create(input: {
  userId: string;
  type: NotificationType;
  actorId?: string | null;
  snippetId?: string | null;
  commentId?: string | null;
}): Promise<void> {
  // Kendi eylemin için bildirim alma — kendi snippet'ine yorum yapınca zil çalmasın.
  if (input.actorId && input.actorId === input.userId) return;

  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        actorId: input.actorId ?? null,
        snippetId: input.snippetId ?? null,
        commentId: input.commentId ?? null,
      },
    });
  } catch (error) {
    logger.error(`Bildirim oluşturulamadı: ${error instanceof Error ? error.message : error}`);
  }
}

/** Snippet'e yorum geldi → snippet sahibine. */
export async function notifyCommentOnSnippet(params: {
  snippetOwnerId: string;
  actorId: string;
  snippetId: string;
  commentId: string;
}): Promise<void> {
  await create({
    userId: params.snippetOwnerId,
    type: 'comment_on_snippet',
    actorId: params.actorId,
    snippetId: params.snippetId,
    commentId: params.commentId,
  });
}

/** Yoruma yanıt geldi → üst yorumun sahibine. */
export async function notifyReplyToComment(params: {
  parentAuthorId: string;
  actorId: string;
  snippetId: string;
  commentId: string;
}): Promise<void> {
  await create({
    userId: params.parentAuthorId,
    type: 'reply_to_comment',
    actorId: params.actorId,
    snippetId: params.snippetId,
    commentId: params.commentId,
  });
}

/** Moderasyon kararı → snippet sahibine. Sistem kaynaklı, `actorId` yok. */
export async function notifyModerationResult(params: {
  snippetOwnerId: string;
  snippetId: string;
  approved: boolean;
}): Promise<void> {
  await create({
    userId: params.snippetOwnerId,
    type: params.approved ? 'snippet_approved' : 'snippet_rejected',
    snippetId: params.snippetId,
  });
}
