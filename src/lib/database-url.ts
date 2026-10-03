// Shared by the app (src/lib/prisma.ts) and the seed script, so no "server-only" import here.

/**
 * Pooled connection string for runtime queries. Accepts our own DATABASE_URL or the
 * POSTGRES_PRISMA_URL that the Supabase ↔ Vercel integration creates.
 */
export function runtimeDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  return url && withLibpqSsl(url);
}

/**
 * node-postgres treats `sslmode=require` as `verify-full`, which rejects Supabase's
 * certificate (signed by Supabase's own CA). Opt into libpq semantics instead:
 * the connection stays encrypted, as it does with psql and Prisma Migrate.
 */
function withLibpqSsl(url: string): string {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (mode && mode !== "verify-full" && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
      return parsed.toString();
    }
  } catch {
    // Not a URL we can parse; let the driver report it.
  }
  return url;
}
