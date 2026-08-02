import 'dotenv/config';
import { Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.contributionHistory.deleteMany();
  await prisma.userInteraction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.snippet.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('Admin123!@#', SALT_ROUNDS);
  const userPassword = await bcrypt.hash('User1234!@#', SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@freewebtools.dev',
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'FWT Admin',
      bio: 'Platform administrator and curator of Free Web Tools.',
      role: 'admin',
      reputationScore: 1000,
      profileVerified: true,
    },
  });

  const contributor1 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      username: 'sarah_dev',
      passwordHash: userPassword,
      fullName: 'Sarah Chen',
      bio: 'Frontend engineer passionate about CSS animations and React.',
      role: 'contributor',
      reputationScore: 450,
      profileVerified: true,
      githubUrl: 'https://github.com/sarahchen',
    },
  });

  const contributor2 = await prisma.user.create({
    data: {
      email: 'marcus@example.com',
      username: 'marcus_js',
      passwordHash: userPassword,
      fullName: 'Marcus Johnson',
      bio: 'Full-stack developer. Node.js, TypeScript, and PostgreSQL enthusiast.',
      role: 'contributor',
      reputationScore: 380,
      profileVerified: true,
      githubUrl: 'https://github.com/marcusjs',
    },
  });

  const contributor3 = await prisma.user.create({
    data: {
      email: 'aiko@example.com',
      username: 'aiko_sec',
      passwordHash: userPassword,
      fullName: 'Aiko Tanaka',
      bio: 'Security researcher and penetration testing specialist.',
      role: 'contributor',
      reputationScore: 520,
      profileVerified: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      username: 'newdev',
      passwordHash: userPassword,
      fullName: 'Alex Developer',
      bio: 'Learning web development, one snippet at a time.',
      role: 'user',
      reputationScore: 25,
    },
  });

  console.log('✅ Users created');

  // Frontend Snippets
  const frontendSnippets = [
    {
      title: 'Glassmorphism Card Component',
      description: 'A beautiful glassmorphism card with frosted glass effect using CSS backdrop-filter. Perfect for modern dashboards and landing pages.',
      codeContent: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.glass-card h3 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.glass-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'beginner' as Difficulty,
      tags: ['css', 'glassmorphism', 'ui', 'card', 'backdrop-filter'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isExecutable: true,
      createdBy: contributor1.id,
    },
    {
      title: 'React Dark Mode Toggle with LocalStorage',
      description: 'A complete dark mode toggle implementation using React hooks, CSS custom properties, and localStorage for persistence.',
      codeContent: `import { useState, useEffect } from 'react';

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || 
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, () => setIsDark(prev => !prev)] as const;
}

// Usage in component
function DarkModeToggle() {
  const [isDark, toggleDark] = useDarkMode();

  return (
    <button
      onClick={toggleDark}
      className="theme-toggle"
      aria-label={\`Switch to \${isDark ? 'light' : 'dark'} mode\`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export { useDarkMode, DarkModeToggle };`,
      codeLanguage: 'typescript',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['react', 'dark-mode', 'hooks', 'typescript', 'localstorage'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isExecutable: true,
      createdBy: contributor1.id,
    },
    {
      title: 'CSS Grid Responsive Dashboard Layout',
      description: 'A responsive dashboard layout using CSS Grid with sidebar, header, and main content area. Collapses gracefully on mobile.',
      codeContent: `.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
}

.dashboard-header {
  grid-area: header;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dashboard-sidebar {
  grid-area: sidebar;
  background: var(--surface-dark);
  padding: 1.5rem;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
}

.dashboard-main {
  grid-area: main;
  padding: 2rem;
  background: var(--background);
  overflow-y: auto;
}

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 64px 1fr;
    grid-template-areas:
      "header"
      "main";
  }

  .dashboard-sidebar {
    display: none; /* Toggle with JS */
  }

  .dashboard-sidebar.open {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 260px;
  }
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['css', 'grid', 'dashboard', 'layout', 'responsive'],
      isExecutable: true,
      createdBy: admin.id,
    },
    {
      title: 'Animated Gradient Button',
      description: 'A stunning animated gradient button with smooth color transitions. Eye-catching CTA button for landing pages.',
      codeContent: `.gradient-btn {
  position: relative;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.gradient-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.gradient-btn:hover::before {
  opacity: 1;
}

.gradient-btn span {
  position: relative;
  z-index: 1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'beginner' as Difficulty,
      tags: ['css', 'button', 'gradient', 'animation', 'ui'],
      isExecutable: true,
      createdBy: contributor1.id,
    },
    {
      title: 'React Custom Hook: useLocalStorage',
      description: 'A type-safe React hook for syncing state with localStorage. Handles SSR, serialization errors, and storage events.',
      codeContent: `import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(\`Error removing localStorage key "\${key}":\`, error);
    }
  }, [key, initialValue]);

  // Sync across tabs
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(initialValue);
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;`,
      codeLanguage: 'typescript',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['react', 'hooks', 'localstorage', 'typescript', 'custom-hook'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'CSS Scroll-Driven Fade-In Animation',
      description: 'Elements gracefully fade in as they enter the viewport using modern CSS scroll-driven animations. No JavaScript needed!',
      codeContent: `/* Modern CSS-only scroll-driven animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-reveal {
  animation: fadeInUp linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}

/* Staggered children */
.scroll-reveal-group > * {
  animation: fadeInUp linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 35%;
}

.scroll-reveal-group > *:nth-child(2) { animation-delay: 100ms; }
.scroll-reveal-group > *:nth-child(3) { animation-delay: 200ms; }
.scroll-reveal-group > *:nth-child(4) { animation-delay: 300ms; }

/* Fallback for browsers without scroll-driven animations */
@supports not (animation-timeline: view()) {
  .scroll-reveal,
  .scroll-reveal-group > * {
    animation: fadeInUp 0.6s ease-out both;
  }
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'advanced' as Difficulty,
      tags: ['css', 'animation', 'scroll', 'no-js', 'modern'],
      isExecutable: true,
      createdBy: contributor1.id,
    },
    {
      title: 'Debounced Search Input with React',
      description: 'A performant search input that debounces API calls. Includes loading state, cancel on unmount, and keyboard shortcuts.',
      codeContent: `import { useState, useEffect, useRef, useCallback } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

function SearchInput({ 
  onSearch, 
  placeholder = 'Search snippets...', 
  debounceMs = 300 
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery) {
      setIsSearching(true);
      onSearch(debouncedQuery);
      // Simulate search complete
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    } else {
      onSearch('');
      setIsSearching(false);
    }
  }, [debouncedQuery, onSearch]);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setQuery('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="search-container">
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {isSearching && <span className="search-spinner" />}
      <kbd className="search-shortcut">⌘K</kbd>
    </div>
  );
}

export { SearchInput, useDebounce };`,
      codeLanguage: 'typescript',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['react', 'search', 'debounce', 'hooks', 'typescript'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'Modern CSS Loading Spinner Collection',
      description: 'Three beautiful CSS-only loading spinners: pulse ring, morphing dots, and gradient spin. Zero dependencies.',
      codeContent: `/* 1. Pulse Ring Spinner */
.spinner-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 2. Morphing Dots */
.spinner-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.spinner-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #667eea;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.spinner-dots span:nth-child(2) { animation-delay: 0.2s; }
.spinner-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { 
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* 3. Gradient Spin */
.spinner-gradient {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg, transparent, #667eea
  );
  mask: radial-gradient(
    farthest-side, transparent calc(100% - 4px), #000 0
  );
  -webkit-mask: radial-gradient(
    farthest-side, transparent calc(100% - 4px), #000 0
  );
  animation: spin 1s linear infinite;
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'beginner' as Difficulty,
      tags: ['css', 'animation', 'loading', 'spinner', 'ui'],
      isExecutable: true,
      createdBy: admin.id,
    },
    {
      title: 'TypeScript Fetch Wrapper with Error Handling',
      description: 'A production-ready fetch wrapper with type safety, automatic JSON parsing, error handling, and request interceptors.',
      codeContent: `interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  setToken(token: string) {
    this.headers['Authorization'] = \`Bearer \${token}\`;
  }

  clearToken() {
    delete this.headers['Authorization'];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = \`\${this.baseUrl}\${endpoint}\`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.error || 'Request failed',
          status: response.status,
          details: data.details,
        } as ApiError;
      }

      return { data, status: response.status, ok: true };
    } catch (error) {
      if ((error as ApiError).status) throw error;
      throw {
        message: 'Network error',
        status: 0,
        details: error,
      } as ApiError;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient('http://localhost:3001/api');
export type { ApiResponse, ApiError };`,
      codeLanguage: 'typescript',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['typescript', 'fetch', 'api', 'error-handling', 'http'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'CSS Container Queries Card Grid',
      description: 'A responsive card grid using CSS Container Queries. Cards adapt their layout based on container size, not viewport.',
      codeContent: `/* Container for the card grid */
.card-grid-container {
  container-type: inline-size;
  container-name: card-grid;
}

.card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

/* Adapt based on container width */
@container card-grid (min-width: 500px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container card-grid (min-width: 800px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Individual card container queries */
.card {
  container-type: inline-size;
  container-name: card;
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-body {
  padding: 1rem;
}

/* Card adapts its own layout */
@container card (min-width: 350px) {
  .card-body {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
    align-items: start;
  }
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'advanced' as Difficulty,
      tags: ['css', 'container-queries', 'grid', 'responsive', 'modern'],
      isExecutable: true,
      createdBy: contributor1.id,
    },
    {
      title: 'React Modal with Focus Trap & Animations',
      description: 'An accessible modal component using the native <dialog> element with focus trap, escape key handling, and smooth animations.',
      codeContent: `import { useRef, useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="modal-dialog"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  );
}

export default Modal;

/* CSS for the modal */
/*
.modal-dialog {
  border: none;
  border-radius: 16px;
  padding: 0;
  max-width: 560px;
  width: 90%;
  background: var(--surface);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-dialog[open] {
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
*/`,
      codeLanguage: 'typescript',
      category: 'frontend',
      difficulty: 'advanced' as Difficulty,
      tags: ['react', 'modal', 'dialog', 'accessibility', 'animation'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'Tailwind CSS Pricing Table',
      description: 'A beautiful 3-tier pricing table built with Tailwind CSS. Features hover effects, highlighted recommended plan, and responsive layout.',
      codeContent: `<!-- Pricing Table with Tailwind CSS -->
<div class="max-w-6xl mx-auto px-4 py-16">
  <h2 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
    Choose Your Plan
  </h2>
  <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
    Start free and scale as you grow. No hidden fees.
  </p>

  <div class="grid md:grid-cols-3 gap-8">
    <!-- Free Plan -->
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-8 
                border border-gray-200 dark:border-gray-700
                hover:border-purple-300 dark:hover:border-purple-600
                transition-all duration-300 hover:-translate-y-1
                hover:shadow-xl">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Free</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">Perfect to get started</p>
      <div class="mt-6 flex items-baseline gap-1">
        <span class="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
        <span class="text-gray-500">/month</span>
      </div>
      <ul class="mt-8 space-y-4">
        <li class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <svg class="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          50 snippets access
        </li>
        <!-- More items... -->
      </ul>
      <button class="mt-8 w-full py-3 px-6 rounded-xl font-semibold
                      border-2 border-purple-600 text-purple-600
                      hover:bg-purple-600 hover:text-white
                      transition-colors duration-200">
        Get Started
      </button>
    </div>

    <!-- Pro Plan (Highlighted) -->
    <div class="relative bg-gradient-to-br from-purple-600 to-indigo-700 
                rounded-2xl p-8 text-white
                shadow-2xl shadow-purple-500/25
                transform md:-translate-y-4
                hover:-translate-y-6 transition-transform duration-300">
      <div class="absolute -top-4 left-1/2 -translate-x-1/2
                  bg-gradient-to-r from-amber-400 to-orange-500
                  text-white text-xs font-bold px-4 py-1.5 rounded-full
                  shadow-lg">
        MOST POPULAR
      </div>
      <h3 class="text-xl font-semibold">Pro</h3>
      <p class="text-purple-200 mt-2 text-sm">For serious developers</p>
      <div class="mt-6 flex items-baseline gap-1">
        <span class="text-5xl font-bold">$19</span>
        <span class="text-purple-200">/month</span>
      </div>
      <button class="mt-8 w-full py-3 px-6 rounded-xl font-semibold
                      bg-white text-purple-700
                      hover:bg-purple-50
                      transition-colors duration-200">
        Start Free Trial
      </button>
    </div>
  </div>
</div>`,
      codeLanguage: 'html',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['tailwind', 'pricing', 'ui', 'responsive', 'html'],
      isExecutable: true,
      createdBy: admin.id,
    },
    {
      title: 'JavaScript Intersection Observer Lazy Loading',
      description: 'Lazy load images and components using the Intersection Observer API. Includes blur placeholder and fade-in effect.',
      codeContent: `class LazyLoader {
  constructor(options = {}) {
    this.defaultImage = options.placeholder || 'data:image/svg+xml,...';
    this.rootMargin = options.rootMargin || '50px';
    this.threshold = options.threshold || 0.1;

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: this.rootMargin,
        threshold: this.threshold,
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadElement(element) {
    const src = element.dataset.src;
    const srcset = element.dataset.srcset;

    if (element.tagName === 'IMG') {
      if (src) element.src = src;
      if (srcset) element.srcset = srcset;
      element.classList.add('loaded');
    } else {
      // Background image
      if (src) element.style.backgroundImage = \`url(\${src})\`;
      element.classList.add('loaded');
    }
  }

  observe(selector = '[data-src]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => this.observer.observe(el));
    return this;
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Usage
const lazyLoader = new LazyLoader({
  rootMargin: '100px',
  threshold: 0.1,
});

// Call after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  lazyLoader.observe();
});

/* CSS */
/*
img[data-src] {
  filter: blur(10px);
  transition: filter 0.5s ease;
}
img[data-src].loaded {
  filter: blur(0);
}
*/`,
      codeLanguage: 'javascript',
      category: 'frontend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['javascript', 'lazy-loading', 'performance', 'intersection-observer'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'CSS Custom Properties Design System',
      description: 'A complete CSS custom properties (variables) design system with colors, spacing, typography, and automatic dark mode.',
      codeContent: `:root {
  /* Colors - HSL for easy manipulation */
  --primary-h: 250;
  --primary-s: 80%;
  --primary-l: 60%;
  --primary: hsl(var(--primary-h) var(--primary-s) var(--primary-l));
  --primary-light: hsl(var(--primary-h) var(--primary-s) 75%);
  --primary-dark: hsl(var(--primary-h) var(--primary-s) 45%);

  /* Neutral */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Semantic */
  --background: var(--gray-50);
  --surface: #ffffff;
  --surface-hover: var(--gray-100);
  --text: var(--gray-900);
  --text-secondary: var(--gray-500);
  --border: var(--gray-200);

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Auto dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: var(--gray-900);
    --surface: var(--gray-800);
    --surface-hover: var(--gray-700);
    --text: var(--gray-50);
    --text-secondary: var(--gray-400);
    --border: var(--gray-700);
  }
}

/* Manual dark mode toggle */
.dark {
  --background: var(--gray-900);
  --surface: var(--gray-800);
  --surface-hover: var(--gray-700);
  --text: var(--gray-50);
  --text-secondary: var(--gray-400);
  --border: var(--gray-700);
}`,
      codeLanguage: 'css',
      category: 'frontend',
      difficulty: 'beginner' as Difficulty,
      tags: ['css', 'variables', 'design-system', 'dark-mode', 'theming'],
      isExecutable: true,
      createdBy: admin.id,
    },
    // Backend Snippets
    {
      title: 'Express.js JWT Authentication Middleware',
      description: 'Production-ready JWT authentication middleware for Express.js with role-based access control and token refresh.',
      codeContent: `const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Invalid token',
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
}

function generateTokenPair(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

module.exports = { authenticate, authorize, generateTokenPair };`,
      codeLanguage: 'javascript',
      category: 'backend',
      difficulty: 'intermediate' as Difficulty,
      tags: ['express', 'jwt', 'authentication', 'middleware', 'security'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'PostgreSQL Full-Text Search with Prisma',
      description: 'Implement fast full-text search in PostgreSQL using Prisma raw queries, tsvector, and tsquery with ranking.',
      codeContent: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. First, add a search vector column via migration:
// ALTER TABLE snippets ADD COLUMN search_vector tsvector;
// CREATE INDEX idx_search ON snippets USING GIN(search_vector);
// UPDATE snippets SET search_vector = 
//   to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''));

interface SearchResult {
  id: string;
  title: string;
  description: string;
  rank: number;
  headline: string;
}

async function searchSnippets(
  query: string,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; total: number }> {
  // Sanitize and format query for tsquery
  const sanitized = query
    .replace(/[^a-zA-Z0-9\\s]/g, '')
    .split(/\\s+/)
    .filter(Boolean)
    .join(' & ');

  if (!sanitized) return { results: [], total: 0 };

  const results = await prisma.$queryRaw<SearchResult[]>\`
    SELECT 
      id,
      title,
      description,
      ts_rank(search_vector, to_tsquery('english', \${sanitized})) as rank,
      ts_headline('english', description, to_tsquery('english', \${sanitized}),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
      ) as headline
    FROM snippets
    WHERE 
      search_vector @@ to_tsquery('english', \${sanitized})
      AND status = 'approved'
    ORDER BY rank DESC
    LIMIT \${limit}
    OFFSET \${offset}
  \`;

  const countResult = await prisma.$queryRaw<[{ count: bigint }]>\`
    SELECT COUNT(*) as count FROM snippets
    WHERE search_vector @@ to_tsquery('english', \${sanitized})
      AND status = 'approved'
  \`;

  return {
    results,
    total: Number(countResult[0].count),
  };
}

export { searchSnippets };`,
      codeLanguage: 'typescript',
      category: 'backend',
      difficulty: 'advanced' as Difficulty,
      tags: ['postgresql', 'search', 'prisma', 'full-text', 'typescript'],
      isExecutable: false,
      createdBy: contributor2.id,
    },
    {
      title: 'Rate Limiter with Sliding Window',
      description: 'A sliding window rate limiter using in-memory storage. Supports per-route and per-user limits. Production-ready.',
      codeContent: `class SlidingWindowRateLimiter {
  constructor() {
    this.windows = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.windows.has(key)) {
      this.windows.set(key, []);
    }

    const timestamps = this.windows.get(key);
    
    // Remove expired timestamps
    const valid = timestamps.filter(t => t > windowStart);
    this.windows.set(key, valid);

    if (valid.length >= limit) {
      const oldestValid = valid[0];
      const retryAfter = Math.ceil((oldestValid + windowMs - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: retryAfter,
        limit,
      };
    }

    valid.push(now);
    return {
      allowed: true,
      remaining: limit - valid.length,
      retryAfterSeconds: 0,
      limit,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.windows.entries()) {
      const valid = timestamps.filter(t => t > now - 3600000);
      if (valid.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, valid);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.windows.clear();
  }
}

// Express middleware factory
function rateLimit({ limit = 100, windowMs = 60000, keyFn } = {}) {
  const limiter = new SlidingWindowRateLimiter();

  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const result = limiter.check(key, limit, windowMs);

    res.set('X-RateLimit-Limit', result.limit);
    res.set('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      res.set('Retry-After', result.retryAfterSeconds);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: result.retryAfterSeconds,
      });
    }

    next();
  };
}

module.exports = { SlidingWindowRateLimiter, rateLimit };`,
      codeLanguage: 'javascript',
      category: 'backend',
      difficulty: 'advanced' as Difficulty,
      tags: ['rate-limiting', 'middleware', 'security', 'express', 'algorithm'],
      isExecutable: true,
      createdBy: contributor2.id,
    },
    {
      title: 'Node.js Password Hashing with bcrypt',
      description: 'Secure password hashing and verification using bcrypt. Includes timing-safe comparison and strength validation.',
      codeContent: `const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// Password strength requirements
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
};

function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(\`Must be at least \${PASSWORD_RULES.minLength} characters\`);
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(\`Must be at most \${PASSWORD_RULES.maxLength} characters\`);
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Must contain an uppercase letter');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Must contain a lowercase letter');
  }
  if (PASSWORD_RULES.requireNumbers && !/\\d/.test(password)) {
    errors.push('Must contain a number');
  }
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Must contain a special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculateStrength(password),
  };
}

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = ['very-weak', 'weak', 'fair', 'strong', 'very-strong'];
  return levels[Math.min(score, levels.length - 1)];
}

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
};`,
      codeLanguage: 'javascript',
      category: 'backend',
      difficulty: 'beginner' as Difficulty,
      tags: ['bcrypt', 'password', 'security', 'authentication', 'node'],
      isExecutable: true,
      createdBy: admin.id,
    },
    {
      title: 'Nmap Network Discovery Script',
      description: 'A comprehensive Nmap scanning script for network reconnaissance. Performs host discovery, port scanning, and service detection. Educational use only.',
      codeContent: `#!/bin/bash
# Nmap Network Discovery Script
# EDUCATIONAL PURPOSE ONLY - Use only on networks you own or have permission to scan
# Author: Security Tools Collection

set -euo pipefail

TARGET="\${1:?Usage: $0 <target-ip-or-range>}"
OUTPUT_DIR="./scan-results/\$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "  Network Discovery Scanner"
echo "  Target: $TARGET"
echo "  Output: $OUTPUT_DIR"
echo "=========================================="

# Phase 1: Host Discovery (Ping Sweep)
echo "[*] Phase 1: Host Discovery..."
nmap -sn "$TARGET" -oG "$OUTPUT_DIR/hosts.gnmap" | tee "$OUTPUT_DIR/phase1_discovery.txt"

# Extract live hosts
grep "Up" "$OUTPUT_DIR/hosts.gnmap" | awk '{print $2}' > "$OUTPUT_DIR/live_hosts.txt"
LIVE_COUNT=$(wc -l < "$OUTPUT_DIR/live_hosts.txt")
echo "[+] Found $LIVE_COUNT live hosts"

# Phase 2: Quick Port Scan (Top 1000)
echo "[*] Phase 2: Quick Port Scan..."
nmap -sS -T4 --top-ports 1000 -iL "$OUTPUT_DIR/live_hosts.txt" \\
  -oA "$OUTPUT_DIR/phase2_ports" | tee "$OUTPUT_DIR/phase2_summary.txt"

# Phase 3: Service Version Detection
echo "[*] Phase 3: Service Detection..."
nmap -sV -sC -O -iL "$OUTPUT_DIR/live_hosts.txt" \\
  -oA "$OUTPUT_DIR/phase3_services" | tee "$OUTPUT_DIR/phase3_summary.txt"

# Phase 4: Vulnerability Scan (NSE scripts)
echo "[*] Phase 4: Vulnerability Check..."
nmap --script=vuln -iL "$OUTPUT_DIR/live_hosts.txt" \\
  -oA "$OUTPUT_DIR/phase4_vulns" 2>/dev/null | tee "$OUTPUT_DIR/phase4_summary.txt"

echo "=========================================="
echo "[✓] Scan complete! Results in: $OUTPUT_DIR"
echo "=========================================="`,
      codeLanguage: 'bash',
      category: 'hacking',
      difficulty: 'intermediate' as Difficulty,
      tags: ['nmap', 'network', 'reconnaissance', 'scanning', 'bash'],
      prerequisites: 'Basic networking knowledge, Linux command line, nmap installed',
      isExecutable: false,
      canDownload: true,
      createdBy: contributor3.id,
    },
    {
      title: 'Python SQL Injection Detection Scanner',
      description: 'A Python script to detect potential SQL injection vulnerabilities in web applications. Tests common injection patterns. For authorized testing only.',
      codeContent: `"""
SQL Injection Detection Scanner
EDUCATIONAL PURPOSE ONLY - Only use on applications you have permission to test

This script tests common SQL injection patterns against URL parameters
to identify potential vulnerabilities.
"""

import requests
import urllib.parse
import sys
from typing import List, Tuple

# Common SQL injection test payloads
PAYLOADS = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' UNION SELECT NULL --",
    "1; DROP TABLE users --",
    "' AND 1=1 --",
    "' AND 1=2 --",
    "admin'--",
    "1' ORDER BY 1--",
    "1' ORDER BY 100--",
]

# Error signatures that indicate SQL injection
SQL_ERRORS = [
    "sql syntax",
    "mysql_fetch",
    "unclosed quotation",
    "microsoft ole db",
    "odbc drivers",
    "postgresql",
    "sqlite3",
    "warning: mysql",
    "valid mysql result",
    "pg_query",
    "ora-01756",
]


def test_parameter(url: str, param: str, value: str) -> List[Tuple[str, str]]:
    """Test a single parameter for SQL injection vulnerabilities."""
    vulnerabilities = []
    
    for payload in PAYLOADS:
        test_url = url.replace(f"{param}={value}", f"{param}={urllib.parse.quote(payload)}")
        
        try:
            response = requests.get(test_url, timeout=10)
            content = response.text.lower()
            
            # Check for SQL error messages
            for error in SQL_ERRORS:
                if error in content:
                    vulnerabilities.append((payload, error))
                    break
            
            # Check for boolean-based blind SQLi
            if payload == "' AND 1=1 --":
                normal_length = len(response.text)
            elif payload == "' AND 1=2 --":
                if abs(len(response.text) - normal_length) > 50:
                    vulnerabilities.append((payload, "Boolean-based blind SQLi detected"))
                    
        except requests.exceptions.RequestException as e:
            print(f"  [!] Request failed: {e}")
            continue
    
    return vulnerabilities


def scan(target_url: str) -> dict:
    """Main scanning function."""
    print(f"\\n{'='*60}")
    print(f"  SQL Injection Scanner")
    print(f"  Target: {target_url}")
    print(f"  Payloads: {len(PAYLOADS)}")
    print(f"{'='*60}\\n")
    
    parsed = urllib.parse.urlparse(target_url)
    params = urllib.parse.parse_qs(parsed.query)
    
    if not params:
        print("[!] No URL parameters found to test")
        return {"vulnerable": False, "params": []}
    
    results = {"vulnerable": False, "params": []}
    
    for param, values in params.items():
        print(f"[*] Testing parameter: {param}")
        vulns = test_parameter(target_url, param, values[0])
        
        if vulns:
            results["vulnerable"] = True
            results["params"].append({
                "name": param,
                "vulnerabilities": vulns,
            })
            print(f"  [!!!] VULNERABLE - {len(vulns)} injection(s) found")
            for payload, error in vulns:
                print(f"    Payload: {payload}")
                print(f"    Evidence: {error}")
        else:
            print(f"  [✓] No vulnerabilities detected")
    
    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sqli_scanner.py <target_url_with_params>")
        print("Example: python sqli_scanner.py 'http://testsite.com/page?id=1'")
        sys.exit(1)
    
    scan(sys.argv[1])`,
      codeLanguage: 'python',
      category: 'hacking',
      difficulty: 'advanced' as Difficulty,
      tags: ['sql-injection', 'python', 'scanner', 'web-security', 'penetration-testing'],
      prerequisites: 'Python 3.8+, requests library, understanding of SQL and HTTP',
      isExecutable: false,
      canDownload: true,
      createdBy: contributor3.id,
    },
  ];

  // Create snippets
  for (const snippetData of frontendSnippets) {
    const slug = snippetData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await prisma.snippet.create({
      data: {
        ...snippetData,
        slug,
        status: 'approved',
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ ${frontendSnippets.length} snippets created`);

  // Create some comments
  const snippets = await prisma.snippet.findMany({ take: 5 });

  const commentData = [
    { content: 'This is exactly what I was looking for! The glassmorphism effect is stunning.', rating: 5 },
    { content: 'Clean implementation. Would love to see a version with CSS Grid fallback.', rating: 4 },
    { content: 'Great tutorial! The video explanation was very helpful for understanding the concepts.', rating: 5 },
    { content: 'Works perfectly in Chrome and Firefox. Minor issues in Safari but overall excellent.', rating: 4 },
    { content: 'I modified this for my project and it works beautifully. Thanks for sharing!', rating: 5 },
    { content: 'Good starting point, but could use better error handling for edge cases.', rating: 3 },
    { content: 'The dark mode toggle is smooth! Integrated it into my portfolio site.', rating: 5 },
    { content: 'Comprehensive and well-documented. This saved me hours of development time.', rating: 5 },
  ];

  const commentUsers = [regularUser, contributor1, contributor2, contributor3, admin];

  for (let i = 0; i < snippets.length; i++) {
    const numComments = Math.min(3, commentData.length - i);
    for (let j = 0; j < numComments; j++) {
      const idx = (i + j) % commentData.length;
      await prisma.comment.create({
        data: {
          snippetId: snippets[i].id,
          userId: commentUsers[(i + j) % commentUsers.length].id,
          content: commentData[idx].content,
          rating: commentData[idx].rating,
        },
      });
    }

    // Update comment count and average rating
    const comments = await prisma.comment.findMany({
      where: { snippetId: snippets[i].id },
      select: { rating: true },
    });

    const ratings = comments.filter(c => c.rating !== null).map(c => c.rating!);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    await prisma.snippet.update({
      where: { id: snippets[i].id },
      data: {
        commentsCount: comments.length,
        averageRating: Math.round(avgRating * 10) / 10,
        viewsCount: Math.floor(Math.random() * 500) + 50,
        likesCount: Math.floor(Math.random() * 100) + 10,
      },
    });
  }

  console.log('✅ Comments created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
