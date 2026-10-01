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
| `npm run storage:setup` | Create the Supabase Storage buckets (one time) |
| `npm run typecheck` / `npm run lint` | Static checks |

## e-Slip storage (Supabase)

Donor slips contain personal bank details, so they live in a **private** bucket and are only
ever viewed by admins through short-lived signed URLs. The database stores only the storage key.

1. In `.env`, set `SUPABASE_URL` (already in `.env.example`) and `SUPABASE_SERVICE_ROLE_KEY`
   (Supabase → Project Settings → API Keys → `service_role` / secret key). This key is
   server-only: never prefix it with `NEXT_PUBLIC_` and never commit it.
2. Run `npm run storage:setup` once. It creates the private `slips` bucket (images only, 5 MB max)
   and the public `media` bucket for activity photos.

Without Supabase credentials, development stores slips in `.data/slips/` (git-ignored).
A production build refuses to start uploads without Supabase unless `SLIP_STORAGE=local` is set
explicitly (for a single-server deployment with a persistent disk).

## Admin panel

Sign in at `/admin` with the account created by `npm run db:seed` (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`). Change that password before going live.

| Role | Can do |
| --- | --- |
| `SUPER_ADMIN`, `ADMIN` | Everything: dashboard, e-Slip review (approve / reject / reopen), content |
| `EDITOR` | Dashboard totals, activities / news / Waqf updates, project page — no slips |

**Content:** posts are plain text (a blank line starts a new paragraph). Photos are resized in the
browser (max 2000 px, JPEG) and stored in the public `media` bucket. Publishing a
"ความคืบหน้าบ้านตะเกียง" post with a percentage moves the home-page progress bar, but only when it is
the newest such update — editing an older one never rolls progress back. Removed or deleted
photos are deleted from storage too.

Every admin page, Server Action and the slip route re-checks the session and role against the
database (`src/lib/dal.ts`); `src/proxy.ts` only does a fast cookie check. Set `AUTH_URL` to the
site's public address and a strong `AUTH_SECRET` (`npx auth secret`).

## Abuse protection

Fixed-window counters in Postgres (`rate_limits` table), so limits hold across server instances:

| Where | Limit |
| --- | --- |
| Donation form | 10 per 10 minutes and 50 per day, per client IP |
| Admin login | 20 attempts / 15 min per IP, 8 attempts / 15 min per email |

IPs and emails are stored only as HMAC hashes (keyed by `AUTH_SECRET`) and expired rows are pruned
automatically. The donation form also has a hidden honeypot field: bots that fill it get a fake
"success" and nothing is saved. Behind a CDN or reverse proxy, make sure it sets
`X-Forwarded-For` (otherwise every visitor looks like the same IP).

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
    storage.ts         # private e-Slip storage (Supabase, or local disk in dev)
    validation/        # zod schemas shared by forms and Server Actions
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
