export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  role: 'guest' | 'user' | 'contributor' | 'admin';
  reputationScore: number;
  profileVerified: boolean;
  avatarUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  lastLogin?: string;
  _count?: {
    snippets: number;
    comments: number;
  };
}

export interface Snippet {
  id: string;
  title: string;
  slug: string;
  description?: string;
  codeContent: string;
  codeLanguage: string;
  category: 'frontend' | 'backend' | 'hacking';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  videoUrl?: string;
  videoSource: 'youtube' | 'internal';
  videoDurationSeconds?: number;
  documentationUrl?: string;
  prerequisites?: string;
  isExecutable?: boolean;
  canDownload: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  averageRating: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    reputationScore?: number;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  rating?: number;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SnippetsResponse {
  snippets: Snippet[];
  pagination: PaginationInfo;
}

export interface SnippetStats {
  total: number;
  byCategory: Record<string, number>;
  /** Hiç puanlanmış snippet yoksa null döner. */
  averageRating: number | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}
