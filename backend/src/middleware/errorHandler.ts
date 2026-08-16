import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`Error: ${err.message}`, err.stack);

  // Zod validation errors
  //
  // Zod v4 `error.errors` alanını `error.issues` olarak yeniden adlandırdı. Burada
  // hâlâ `.errors` okunuyordu ve `as any` cast'i tip hatasını gizlediği için sorun
  // sessizce sürdü: dizi `undefined` gelince `.map` patlıyor, hata yöneticisinin
  // kendisi hata veriyor ve istemciye 400 yerine 500 dönüyordu. Yani API'deki HER
  // doğrulama hatası "Internal server error" olarak görünüyordu.
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ error: 'Validation failed', details });
    return;
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'A record with this value already exists' });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  // Custom app errors
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
}
