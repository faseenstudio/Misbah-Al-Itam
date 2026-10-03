# Deploying to Vercel (with Supabase)

The site runs on **Vercel** (functions in Seoul, `icn1`, next to the Supabase database in
`ap-northeast-2`). The database and file storage are the Supabase project
`rlzuzjcjktagozdwfnof`. The `slips` (private) and `media` (public) buckets already exist.

## 1. Get the values from Supabase

In the Supabase dashboard → **Connect** (top bar):

| Vercel variable | Where to copy it from |
| --- | --- |
| `DATABASE_URL` | **Transaction pooler** connection string (port **6543**). Replace `[YOUR-PASSWORD]` with the database password. |
| `DIRECT_URL` | **Session pooler** connection string (port **5432**). Used only for migrations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → `service_role` / secret key |

If you don't know the database password, reset it under Project Settings → Database.

## 2. Create the Vercel project

1. Push this repository to GitHub (branch `main` or the branch you want to deploy).
2. On vercel.com → **Add New… → Project** → import the GitHub repository.
3. Framework preset: **Next.js** (detected automatically). Leave build settings as they are:
   `vercel.json` sets the build command to `npm run vercel-build` (migrations on production, then
   `next build`). In the Build Logs you should see `[vercel-build] production: applying migrations`.
4. Add **Environment Variables** (tick *Production*; also *Preview* if you want previews to work):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | transaction pooler URL (6543) |
   | `DIRECT_URL` | session pooler URL (5432) |
   | `AUTH_SECRET` | output of `npx auth secret` (or `openssl rand -base64 32`) |
   | `SUPABASE_URL` | `https://rlzuzjcjktagozdwfnof.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | the secret key — **never** prefix with `NEXT_PUBLIC_` |

   Do **not** set `AUTH_URL` or `SLIP_STORAGE` on Vercel.

   **Using the Supabase ↔ Vercel integration instead?** It creates `POSTGRES_PRISMA_URL`,
   `POSTGRES_URL_NON_POOLING`, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY`; the app
   falls back to those automatically, so you only need to add `AUTH_SECRET` yourself.
5. Click **Deploy**.

The production build runs `prisma migrate deploy` (creating all tables, with Row Level Security
switched on so Supabase's public Data API can't read them) and then `next build`.
Preview builds skip migrations so unfinished branches can't change the live database.

## 3. Create the funds and the first admin (once)

From your computer, in the project folder, run the seed against the production database:

```bash
DATABASE_URL="<transaction pooler URL>" \
SEED_ADMIN_EMAIL="you@example.org" \
SEED_ADMIN_PASSWORD="<a long, unique password>" \
npm run db:seed
```

This adds the 5 Islamic Bank fund accounts, the Baan Takiang project, and your admin login.
Running it again is safe (it never overwrites an existing admin).

## 4. Custom domain

Vercel project → **Settings → Domains** → add the domain and follow the DNS instructions.
HTTPS is automatic.

## 5. Smoke test after each deploy

- [ ] Home page shows the 5 funds and the Baan Takiang progress bar
- [ ] `/donate`: submit a small test donation with a slip → you get an `MSB-…` reference
- [ ] Supabase → Storage → `slips` contains the new file
- [ ] `/admin` → log in → the test donation is in *รอตรวจสอบ*; the slip image opens
- [ ] Approve it → the dashboard total updates
- [ ] Post a test activity with a photo → it appears on `/activities` (then delete it)

## Limits worth knowing

- Vercel accepts at most **4.5 MB** per request. Slips over 2 MB and all activity photos are
  shrunk in the browser before upload (a 10 MB phone photo becomes < 1 MB), and the server
  accepts at most 4 MB per image.
- Rate limits use the visitor IP from Vercel's `X-Forwarded-For` header — no setup needed.
