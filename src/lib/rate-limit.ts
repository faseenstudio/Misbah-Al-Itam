import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export type Limit = { bucket: string; max: number; windowSeconds: number };

/** Public donation form: generous for real donors, blocks floods. */
export const DONATION_LIMITS: Limit[] = [
  { bucket: "donate-10m", max: 10, windowSeconds: 10 * 60 },
  { bucket: "donate-1d", max: 50, windowSeconds: 24 * 60 * 60 },
];
/** Admin login, counted per client IP and per email address. */
export const LOGIN_IP_LIMIT: Limit = { bucket: "login-ip", max: 20, windowSeconds: 15 * 60 };
export const LOGIN_EMAIL_LIMIT: Limit = { bucket: "login-email", max: 8, windowSeconds: 15 * 60 };

/**
 * Identifiers are HMAC-hashed with AUTH_SECRET so raw IPs / emails never land in the
 * database (PDPA-friendly) and can't be reversed from a leaked table.
 */
function hashId(value: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "rate-limit").update(value).digest("base64url").slice(0, 22);
}

/** Best-effort client IP. Behind a proxy/CDN this is the first x-forwarded-for hop. */
export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
}

export async function currentClientIp() {
  return clientIp(await headers());
}

/**
 * Count one hit against every limit. Returns false when any limit is exceeded.
 * Fixed windows, one atomic upsert per limit — safe under concurrent requests and
 * across multiple server instances.
 */
export async function hit(identifier: string, limits: Limit[]): Promise<boolean> {
  const now = Date.now();
  const id = hashId(identifier);
  let allowed = true;

  for (const { bucket, max, windowSeconds } of limits) {
    const windowIndex = Math.floor(now / (windowSeconds * 1000));
    const expiresAt = new Date((windowIndex + 1) * windowSeconds * 1000);
    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
      INSERT INTO rate_limits ("key", "count", "expiresAt")
      VALUES (${`${bucket}:${id}:${windowIndex}`}, 1, ${expiresAt})
      ON CONFLICT ("key") DO UPDATE SET "count" = rate_limits."count" + 1
      RETURNING "count"`;
    if ((rows[0]?.count ?? 0) > max) allowed = false;
  }

  // Occasionally prune expired windows instead of needing a cron job.
  if (Math.random() < 0.02) {
    await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }).catch(() => {});
  }
  return allowed;
}
