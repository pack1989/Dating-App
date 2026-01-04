Dating App (Nigeria) - MVP

Overview
- Location-aware dating site for Nigeria with religion and ethnicity preferences.
- Core sections: Profile, People, Liked You, Chats.

Stack (recommended, low cost)
- Frontend: Next.js (App Router) + TypeScript
- Backend: Next.js API routes + Prisma
- Database: Postgres
- Media storage: Cloudflare R2 (cheap S3-compatible)

Getting Started (local)
1) Copy .env.example to .env and fill values.
2) Install dependencies: npm install
3) Run dev server: npm run dev
4) Initialize database: npx prisma migrate dev

Docs
- docs/PRODUCT.md
- docs/ARCHITECTURE.md
- docs/ROADMAP.md
- docs/API.md
