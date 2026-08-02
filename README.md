# Free-Web-Tools FWT — Free Web Tools
A community-driven code snippet hub with video walkthroughs, built for developers who learn by watching and reading code.
What is FWT?
FWT is an aggregator platform where developers share working code snippets paired with short tutorial videos. Think of it as the missing link between a Stack Overflow answer and a full YouTube tutorial — you get the code and someone walking through why it works, in one place.
Every snippet lives in one of three categories:
Frontend — runnable, testable snippets you can preview right in the browser
Backend — server-side and database snippets, also testable in a sandboxed environment
Hacking — educational security content: view-only code, documentation, and video context (never executable, always moderated)
Why FWT?
Most code-sharing sites give you a wall of text with no context, or a video with no easy way to grab the code. FWT closes that gap:
📹 Every snippet has a video — contributors record a walkthrough (YouTube embed or direct upload) alongside the code they publish
🧪 Frontend/backend code is testable — not just a read-only gist, you can actually run it
🛡️ Hacking content is educational-only — locked from execution, reviewed before publishing, with automated flagging for anything resembling malware or exploits
🌍 Built by and for the community — contributors earn reputation for sharing quality content
Tech Stack
Frontend: Next.js 14, TypeScript, Tailwind CSS + shadcn/ui
Backend: Node.js, Express, Prisma ORM
Database: PostgreSQL with full-text search
Video/Storage: Cloudinary
Auth: JWT-based authentication
Design
FWT runs on a Terminal / Hacker Zine aesthetic — a warm charcoal-black background, amber accents for Frontend/Backend content, and a cooler blue accent marking the Hacking section apart. Snippet cards are styled like terminal windows, right down to the macOS-style dots and file-name title bar. Typography pairs JetBrains Mono for headers and code with Inter for body text.
Roadmap
Phase 1: Frontend snippets, core auth, MVP launch
Phase 2: Backend snippets, comments, ratings, admin panel
Phase 3: Hacking section with strict moderation pipeline
Phase 4: Premium features, analytics, newsletter
Utilities Included
Beyond snippets, FWT ships a growing toolbox: link shortener, QR generator, JSON formatter, hash generator, base64 encode/decode, color converter, regex tester, markdown previewer, cron expression generator, diff checker, UUID generator, and password generator.
Content Policy
Educational content only — no malware, exploits, or DDoS tooling. All hacking-category submissions go through admin review before publishing.
FWT is the first project under the TOYWES ecosystem — a family of tools built for the community's benefit.