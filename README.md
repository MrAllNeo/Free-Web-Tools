<div align="center">

# free/web/tools

**A community-driven code snippet hub with video walkthroughs — plus a toolbox of instant developer utilities.**

Built for developers who learn by watching *and* reading code.

`Next.js 16` · `React 19` · `TypeScript` · `Tailwind CSS v4` · `Express 5` · `Prisma 7` · `PostgreSQL`

</div>

---

## What is FWT?

FWT is an aggregator platform where developers share working code snippets paired with short tutorial videos. Think of it as the missing link between a Stack Overflow answer and a full YouTube tutorial — you get the code *and* someone walking through why it works, in one place.

Most code-sharing sites give you a wall of text with no context, or a video with no easy way to grab the code. FWT closes that gap.

## Why FWT?

- **📹 Every snippet has a video** — contributors record a walkthrough (YouTube embed or direct upload) alongside the code they publish.
- **🧪 Frontend code is testable** — not a read-only gist. Snippets render live in a sandboxed iframe you can reload and open fullscreen.
- **🛡️ Hacking content is educational-only** — locked from execution, reviewed before publishing, with automated flagging for anything resembling malware or exploits.
- **🧰 Instant utilities, zero friction** — a growing toolbox that needs no account and, for 12 of the 13 tools, never sends your data to a server.
- **🌍 Built by and for the community** — contributors earn reputation for sharing quality content.

## The four sections

| # | Section | What lives here | Code execution |
|---|---------|-----------------|----------------|
| 01 | **Frontend** | UI components, CSS effects, animations | Live preview in browser |
| 02 | **Backend** | Auth systems, API patterns, DB schemas | Runnable / testable |
| 03 | **Hacking** | Pentest techniques, vulnerability analysis | **View-only**, never executed |
| 04 | **Tools** | Standalone developer utilities | Runs instantly, no account |

## The toolbox

Thirteen single-purpose utilities, each on its own SEO-friendly route at `/tools/<slug>`.

| Tool | Runs where | Status |
|------|-----------|--------|
| Password Generator | Browser | ✅ Live |
| UUID Generator | Browser | ✅ Live |
| Color Converter (HEX/RGB/HSL) | Browser | ✅ Live |
| JSON Formatter / Validator | Browser | 🚧 Planned |
| Hash Generator (MD5/SHA-256/SHA-512) | Browser | 🚧 Planned |
| Base64 Encode / Decode | Browser | 🚧 Planned |
| Regex Tester | Browser | 🚧 Planned |
| Markdown → HTML Preview | Browser | 🚧 Planned |
| Diff Checker | Browser | 🚧 Planned |
| Cron Expression Generator | Browser | 🚧 Planned |
| QR Code Generator | Browser | 🚧 Planned |
| Image to Base64 | Browser | 🚧 Planned |
| Link Shortener | Server | 🚧 Planned |

Passwords are generated with `crypto.getRandomValues` and rejection sampling — no modulo bias, no network round-trip, ever.

## Design

FWT runs on a **terminal / hacker-zine aesthetic**: a warm charcoal-black canvas, amber accents for Frontend and Backend content, and a cooler blue marking the Hacking section apart. Green is reserved for the Tools section, so you always know which part of the site you're in.

Snippet cards and code panels are styled like terminal windows, right down to the macOS-style dots and filename title bar. Typography pairs **JetBrains Mono** for headings, code, and UI chrome with **Inter** for body copy. The interface is dark-only by design — no theme toggle, one carefully tuned palette.

## Tech stack

**Frontend**
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with a CSS-variable design-token layer
- TanStack Query (data fetching), Zustand (auth state), React Hook Form + Zod (forms)
- `react-syntax-highlighter` with a custom Prism theme matching the palette
- Framer Motion for entrance transitions

**Backend**
- Node.js + Express 5 + TypeScript
- Prisma 7 ORM over PostgreSQL
- JWT authentication with bcrypt password hashing
- Helmet, CORS, and Zod request validation

## Getting started

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
git clone git@github.com:MrAllNeo/Free-Web-Tools.git
cd Free-Web-Tools

# Install dependencies
npm install
(cd frontend && npm install)
(cd backend && npm install)

# Configure the backend
cp backend/.env.example backend/.env
# → fill in DATABASE_URL and JWT_SECRET

# Set up the database
(cd backend && npx prisma db push && npm run seed)

# Run both servers (frontend :3000, backend :3001)
npm run dev
```

The seed creates a demo admin account: `admin@freewebtools.dev` / `Admin123!@#`.

## Project structure

```
Free-Web-Tools/
├── frontend/                  # Next.js app
│   └── src/
│       ├── app/               # Routes (App Router)
│       │   ├── snippets/      # Archive, detail, submission
│       │   ├── tools/         # Utility pages
│       │   ├── auth/          # Login / register
│       │   ├── profile/       # Account settings
│       │   └── admin/         # Moderation queue
│       ├── components/
│       │   ├── ui/            # Design-system primitives
│       │   ├── home/          # Landing page sections
│       │   ├── snippets/      # Code viewer, live preview, cards
│       │   └── tools/         # Reusable tool widgets
│       └── lib/               # API client, stores, tool logic, types
└── backend/                   # Express API
    ├── src/
    │   ├── controllers/       # Request handlers
    │   ├── routes/            # Route definitions
    │   ├── middleware/        # Auth, validation, error handling
    │   └── utils/             # Zod schemas, logger
    └── prisma/                # Schema and seed data
```

Tool logic lives in `frontend/src/lib/tools/` as pure, framework-free functions, so the same implementation powers both the homepage live demo and the standalone tool page.

## API overview

```
POST   /api/auth/register        Create an account
POST   /api/auth/login           Sign in
GET    /api/auth/me              Current user

GET    /api/snippets             List (pagination, filters, search, sort)
GET    /api/snippets/stats       Totals, per-category counts, average rating
GET    /api/snippets/:idOrSlug   Snippet detail with comments
POST   /api/snippets             Create (contributors and admins)
PUT    /api/snippets/:id         Update (owner)
DELETE /api/snippets/:id         Delete (owner or admin)

PUT    /api/users/me             Update your profile
```

Comments, likes/saves, moderation, and the link-shortener endpoints are the next milestone.

## Roadmap

- [x] **Phase 1** — Design system, landing page, snippet archive and detail, auth flow
- [x] **Phase 2** — Utilities section with the first three live tools
- [ ] **Phase 3** — Remaining ten tools, comments and ratings, likes and bookmarks
- [ ] **Phase 4** — Moderation pipeline for the Hacking section, admin analytics
- [ ] **Phase 5** — Video uploads, newsletter, search at scale

## Content policy

**Educational content only.** No malware, ransomware, credential stealers, phishing kits, or DDoS tooling. Penetration-testing techniques, vulnerability analysis, CTF write-ups, and bug-bounty reports are welcome — every Hacking-category submission passes through admin review before it is published, and code in that category is never executable on the platform.

## Contributing

Contributions are genuinely welcome — this is a community project.

1. Fork the repository and create a branch off `main`.
2. Keep the existing code style: TypeScript throughout, design tokens instead of hard-coded colors, comments that explain *why* rather than *what*.
3. Run `npm run lint` and `npm run build` in `frontend/` before opening a PR.
4. Describe what you changed and why.

Adding a tool? Put the pure logic in `frontend/src/lib/tools/`, the widget in `frontend/src/components/tools/`, register it in `frontend/src/lib/constants.ts`, and give it a page under `frontend/src/app/tools/`.

## Open source

FWT is fully open source. Every line of the platform — the design system, the API, the tools, the moderation logic — lives in this repository. Fork it, learn from it, ship your own version of it.

---

<div align="center">

FWT is the first project under the **TOYWES** ecosystem — a family of tools built for the community's benefit.

*kodu gör, videoda izle, aracı kullan*

</div>
