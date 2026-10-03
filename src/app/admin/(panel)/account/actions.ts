"use server";

import bcrypt from "bcryptjs";

import { authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { fieldErrors } from "@/lib/validation/content";
import { changePasswordSchema, type ChangePasswordErrors } from "@/lib/validation/user";

export type ChangePasswordState = { errors?: ChangePasswordErrors; formError?: string; success?: number };

export async function changeOwnPassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const admin = await authorizeAdmin();
  if (!admin) return { formError: "กรุณาเข้าสู่ระบบใหม่" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = await prisma.user.findUnique({ where: { id: admin.id }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return { errors: { currentPassword: "รหัสผ่านปัจจุบันไม่ถูกต้อง" } };
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
  });
  return { success: Date.now() };
}
