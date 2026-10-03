import Link from "next/link";
import { CircleCheck, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_MANAGER_ROLES, requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";

export const metadata = { title: "ผู้ดูแลระบบ" };

const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

const SAVED_MESSAGES: Record<string, string> = {
  created: "เพิ่มผู้ดูแลเรียบร้อยแล้ว",
  updated: "บันทึกการแก้ไขแล้ว",
  deleted: "ลบผู้ดูแลแล้ว",
};

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const admin = await requireAdmin(USER_MANAGER_ROLES);
  const { saved } = await searchParams;
  const message = typeof saved === "string" ? SAVED_MESSAGES[saved] : undefined;

  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">ผู้ดูแลระบบ</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไขสิทธิ์ รีเซ็ตรหัสผ่าน หรือปิดการใช้งานบัญชีผู้ดูแล</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/users/new">
            <Plus />
            เพิ่มผู้ดูแล
          </Link>
        </Button>
      </header>

      {message && (
        <Alert variant="success">
          <CircleCheck />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/users/${u.id}`}
              className="flex flex-col gap-1.5 p-4 hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-primary">
                  {u.name}
                  {u.id === admin.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(คุณ)</span>}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{u.email}</span>
              </span>
              <span className="text-xs text-muted-foreground sm:w-48 sm:text-right">
                {u.lastLoginAt ? `เข้าระบบล่าสุด ${dateTime.format(u.lastLoginAt)}` : "ยังไม่เคยเข้าระบบ"}
              </span>
              <span className="flex gap-2 sm:w-44 sm:justify-end">
                <Badge variant={u.role === "SUPER_ADMIN" ? "gold" : u.role === "ADMIN" ? "default" : "soft"}>
                  {ROLE_LABELS[u.role]}
                </Badge>
                {!u.isActive && <Badge variant="destructive">ปิดใช้งาน</Badge>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
