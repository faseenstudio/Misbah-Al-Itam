"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { USER_MANAGER_ROLES, authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { fieldErrors } from "@/lib/validation/content";
import { createUserSchema, updateUserSchema, type UserFormErrors } from "@/lib/validation/user";
import { Prisma } from "@/generated/prisma/client";

export type UserFormState = { errors?: UserFormErrors; formError?: string };

const BCRYPT_COST = 12;
const EMAIL_TAKEN: UserFormState = { errors: { email: "อีเมลนี้มีผู้ใช้อยู่แล้ว" } };

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/** Would removing `userId` from the active super admins leave nobody who can manage accounts? */
async function isLastSuperAdmin(userId: string) {
  const others = await prisma.user.count({
    where: { role: "SUPER_ADMIN", isActive: true, NOT: { id: userId } },
  });
  return others === 0;
}

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const admin = await authorizeAdmin(USER_MANAGER_ROLES);
  if (!admin) return { formError: "คุณไม่มีสิทธิ์จัดการผู้ดูแลระบบ" };

  const parsed = createUserSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { password, ...data } = parsed.data;

  try {
    await prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, BCRYPT_COST) } });
  } catch (error) {
    if (isUniqueViolation(error)) return EMAIL_TAKEN;
    console.error("[admin] create user failed", error);
    return { formError: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
  redirect("/admin/users?saved=created");
}

export async function updateUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const admin = await authorizeAdmin(USER_MANAGER_ROLES);
  if (!admin) return { formError: "คุณไม่มีสิทธิ์จัดการผู้ดูแลระบบ" };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { formError: "ไม่พบผู้ใช้นี้" };
  const isSelf = id === admin.id;

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
    password: isSelf ? "" : (formData.get("password") ?? ""),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { password, ...data } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!target) return { formError: "ไม่พบผู้ใช้นี้ อาจถูกลบไปแล้ว" };

  // You can't lock yourself out; others can't remove the last account that manages users.
  if (isSelf && data.role !== target.role) return { errors: { role: "เปลี่ยนสิทธิ์ของตัวเองไม่ได้" } };
  if (isSelf && !data.isActive) return { errors: { isActive: "ปิดการใช้งานบัญชีของตัวเองไม่ได้" } };
  const losesSuperAdmin = target.role === "SUPER_ADMIN" && target.isActive && (data.role !== "SUPER_ADMIN" || !data.isActive);
  if (losesSuperAdmin && (await isLastSuperAdmin(id))) {
    return { formError: "ต้องมีผู้ดูแลสูงสุดที่ใช้งานอยู่อย่างน้อย 1 คน" };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, BCRYPT_COST) } : {}) },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return EMAIL_TAKEN;
    console.error("[admin] update user failed", error);
    return { formError: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
  redirect("/admin/users?saved=updated");
}

export async function deleteUser(formData: FormData) {
  const admin = await authorizeAdmin(USER_MANAGER_ROLES);
  const id = formData.get("id");
  if (!admin || typeof id !== "string") return;
  if (id === admin.id) redirect(`/admin/users/${id}?error=self`);

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!target) redirect("/admin/users");
  if (target.role === "SUPER_ADMIN" && target.isActive && (await isLastSuperAdmin(id))) {
    redirect(`/admin/users/${id}?error=last`);
  }

  // Reviewed donations and posts keep their history; their reviewer/author becomes empty.
  await prisma.user.delete({ where: { id } });
  redirect("/admin/users?saved=deleted");
}
