# มูลนิธิตะเกียงเด็กกำพร้า · Misbah Al-Itam Foundation

Website for the foundation: activities and news, progress updates on the **Baan Takiang (บ้านตะเกียง)** Waqf project, and online donations with e-Slip verification.

## Stack

- **Next.js 16** (App Router, Server Actions) · React 19 · TypeScript
- **Tailwind CSS v4** with shadcn/ui tokens (navy primary, gold accent) · Radix UI · lucide-react
- **PostgreSQL** + **Prisma 7** (`prisma-client` generator, `@prisma/adapter-pg` driver adapter)
- **Auth.js / NextAuth v5** (Credentials + JWT) for the admin panel
- **Supabase Storage** for e-Slips (private bucket) and activity images

## Getting started

```bash
cp .env.example .env          # set DATABASE_URL, AUTH_SECRET, SEED_ADMIN_*
npm install                   # also runs `prisma generate`
npm run db:migrate            # create tables
npm run db:seed               # 5 funds, Baan Takiang project, first admin
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Upsert funds, featured project, and admin user |
| `npm run db:studio` | Browse data in Prisma Studio |
| `npm run typecheck` / `npm run lint` | Static checks |

## Project structure

```
prisma/
  schema.prisma        # User, Fund, Donation, Project, Activity
  migrations/          # SQL migrations
  seed.ts              # seeds the 5 Islamic Bank of Thailand fund accounts
prisma.config.ts       # Prisma 7 config (datasource URL, seed command)
src/
  app/                 # App Router: (public) site + /admin panel
  components/ui/       # shadcn/ui primitives
  generated/prisma/    # generated Prisma client (git-ignored)
  lib/
    constants.ts       # foundation info + fund definitions (single source of truth)
    prisma.ts          # PrismaClient singleton (server-only)
    utils.ts           # cn() helper
```

## Donation funds (ธนาคารอิสลามแห่งประเทศไทย)

| Slug | Fund | Account |
| --- | --- | --- |
| `admin` | เพื่อการบริหาร | 061-1-16459-0 |
| `orphans` | สานฝันเด็กกำพร้าและผู้ยากไร้ | 061-1-16461-2 |
| `waqf` | บ้านตะเกียง | 061-1-16458-2 |
| `zakat` | กองทุนซะกาต | 061-1-16462-0 |
| `education` | ให้น้องได้เรียน | 061-1-16460-4 |
