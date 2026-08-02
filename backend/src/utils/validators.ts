import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must be at most 100 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().max(255).optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),
  // Boş metne izin verilir: kullanıcının alanı temizlemesi bu şekilde ifade edilir.
  avatarUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  parentCommentId: z.string().uuid().optional(),
});

export const moderateSnippetSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
});

export const shortenUrlSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  // Süresiz linkler kalıcı olarak veritabanında birikir; 1-365 gün arası sınır konulabilir.
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createSnippetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().optional(),
  codeContent: z.string().min(1, 'Code content is required'),
  codeLanguage: z.string().min(1, 'Code language is required'),
  category: z.enum(['frontend', 'backend', 'hacking']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  tags: z.array(z.string()).default([]),
  // Frontend snippet'leri canlı çalıştırılır; backend/hacking için katkıcı
  // video mu görsel mi göstereceğini kendisi seçer.
  mediaType: z.enum(['video', 'image', 'live', 'none']).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  videoSource: z.enum(['youtube', 'internal']).default('youtube'),
  videoDurationSeconds: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageCaption: z.string().max(300).optional(),
  documentationUrl: z.string().url().optional().or(z.literal('')),
  prerequisites: z.string().optional(),
  isExecutable: z.boolean().optional(),
  canDownload: z.boolean().default(true),
});

export const updateSnippetSchema = createSnippetSchema.partial();

export const snippetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  category: z.enum(['frontend', 'backend', 'hacking']).optional(),
  language: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
  sort: z.enum(['latest', 'popular', 'top-rated']).default('latest'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type SnippetQuery = z.infer<typeof snippetQuerySchema>;
