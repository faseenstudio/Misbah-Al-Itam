-- Supabase exposes every table in the "public" schema through its auto-generated Data API
-- (PostgREST), reachable with the project's public anon key. This app never uses that API:
-- it connects directly as the table owner, which bypasses RLS. Enabling RLS with NO policies
-- therefore blocks all Data API access (donor details, password hashes) without affecting the app.
-- On plain PostgreSQL (local dev) this is harmless.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "funds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
