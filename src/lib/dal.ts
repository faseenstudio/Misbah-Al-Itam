import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

/** Roles allowed to review donations; EDITOR manages content only. */
export const DONATION_REVIEWER_ROLES: readonly Role[] = ["SUPER_ADMIN", "ADMIN"];

/** Roles allowed to manage activities, news and project pages. */
export const CONTENT_EDITOR_ROLES: readonly Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

/** Roles allowed to add, edit and remove admin accounts. */
export const USER_MANAGER_ROLES: readonly Role[] = ["SUPER_ADMIN"];

/**
 * The signed-in admin, re-checked against the database on every request so a
 * deactivated account or changed role takes effect immediately (the JWT alone can't).
 */
export const getAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findFirst({
    where: { id: session.user.id, isActive: true },
    select: { id: true, name: true, email: true, role: true },
  });
});

/** For pages: redirect to login when signed out, or to the dashboard when the role is not allowed. */
export async function requireAdmin(roles?: readonly Role[]) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (roles && !roles.includes(admin.role)) redirect("/admin");
  return admin;
}

/** For Server Actions and Route Handlers: return null instead of redirecting. */
export async function authorizeAdmin(roles?: readonly Role[]) {
  const admin = await getAdmin();
  if (!admin || (roles && !roles.includes(admin.role))) return null;
  return admin;
}
