Architecture

Frontend
- Next.js App Router.
- Pages for profile, people, liked you, chats.

Backend
- Next.js route handlers (API routes).
- Prisma ORM with Postgres.
- JWT auth (email + password).

Storage
- Use Cloudflare R2 for media storage (photos and videos).
- Store media metadata in Postgres.

Security
- Passwords hashed with bcrypt.
- JWT stored in httpOnly cookie.
- Validate inputs with Zod.
