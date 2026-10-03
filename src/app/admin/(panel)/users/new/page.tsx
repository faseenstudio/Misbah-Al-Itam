import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { UserForm } from "@/components/admin/user-form";
import { USER_MANAGER_ROLES, requireAdmin } from "@/lib/dal";

export const metadata = { title: "เพิ่มผู้ดูแล" };

export default async function NewUserPage() {
  await requireAdmin(USER_MANAGER_ROLES);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/users" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายชื่อผู้ดูแล
      </Link>
      <h1 className="text-2xl font-bold text-primary">เพิ่มผู้ดูแล</h1>
      <UserForm initial={{ name: "", email: "", role: "ADMIN", isActive: true }} />
    </div>
  );
}
