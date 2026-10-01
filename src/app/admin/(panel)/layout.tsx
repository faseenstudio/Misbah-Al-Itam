import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { signOut } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/site/logo";
import { getPendingCount } from "@/lib/admin-queries";
import { DONATION_REVIEWER_ROLES, requireAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: { default: "ระบบผู้ดูแล", template: "%s | ระบบผู้ดูแล" },
  robots: { index: false, follow: false },
};

const ROLE_LABELS = { SUPER_ADMIN: "ผู้ดูแลสูงสุด", ADMIN: "ผู้ดูแล", EDITOR: "ผู้จัดการเนื้อหา" } as const;

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  // Pages re-check authorization themselves; this only needs the admin for the shell.
  const admin = await requireAdmin();
  const canReview = DONATION_REVIEWER_ROLES.includes(admin.role);
  const pendingCount = canReview ? await getPendingCount() : 0;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="flex flex-col gap-4 bg-primary px-4 py-4 text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-semibold">ระบบผู้ดูแล</span>
              <span className="text-xs text-white/60">มูลนิธิตะเกียงเด็กกำพร้า</span>
            </div>
          </div>
        </div>
        <AdminNav pendingCount={pendingCount} canReview={canReview} />
        <div className="hidden border-t border-white/10 pt-4 text-sm lg:mt-auto lg:block">
          <p className="font-medium">{admin.name}</p>
          <p className="text-xs text-white/60">{ROLE_LABELS[admin.role]}</p>
        </div>
        <form action={logout} className="lg:-mt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-background px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
