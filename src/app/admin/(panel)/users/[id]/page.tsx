import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ChevronLeft } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { UserForm } from "@/components/admin/user-form";
import { USER_MANAGER_ROLES, requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "../actions";

export const metadata = { title: "แก้ไขผู้ดูแล" };

const DELETE_ERRORS: Record<string, string> = {
  self: "ลบบัญชีของตัวเองไม่ได้",
  last: "ลบไม่ได้ ต้องมีผู้ดูแลสูงสุดที่ใช้งานอยู่อย่างน้อย 1 คน",
};

export default async function EditUserPage({ params, searchParams }: PageProps<"/admin/users/[id]">) {
  const admin = await requireAdmin(USER_MANAGER_ROLES);
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user) notFound();
  const isSelf = user.id === admin.id;
  const deleteError = typeof error === "string" ? DELETE_ERRORS[error] : undefined;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/users" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายชื่อผู้ดูแล
      </Link>
      <div className="flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">แก้ไขผู้ดูแล</h1>
        {!isSelf && (
          <form action={deleteUser}>
            <input type="hidden" name="id" value={user.id} />
            <ConfirmDeleteButton
              message={`ลบบัญชี “${user.name}” (${user.email})? ประวัติการตรวจสลิปและโพสต์ยังอยู่ แต่จะไม่แสดงชื่อผู้ทำ หากต้องการเก็บชื่อไว้ ให้ปิดการใช้งานแทน`}
              label="ลบบัญชี"
            />
          </form>
        )}
      </div>
      {deleteError && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
      <UserForm initial={user} isSelf={isSelf} />
    </div>
  );
}
