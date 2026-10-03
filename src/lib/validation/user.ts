import { z } from "zod";

/** Shared by the admin-user forms (client) and their Server Actions (server). */

export const PASSWORD_MIN = 12;

const password = z
  .string()
  .min(PASSWORD_MIN, `รหัสผ่านต้องยาวอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`)
  .max(200, "รหัสผ่านยาวเกินไป");

const base = {
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกิน 100 ตัวอักษร"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("อีเมลไม่ถูกต้อง").max(200, "อีเมลยาวเกินไป")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"], { error: "กรุณาเลือกสิทธิ์" }),
};

export const createUserSchema = z.object({ ...base, password });

export const updateUserSchema = z.object({
  ...base,
  isActive: z.boolean(),
  // Blank = keep the current password.
  password: z.union([z.literal(""), password]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน").max(200),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม",
  });

export type UserFormErrors = Partial<Record<keyof z.input<typeof updateUserSchema>, string>>;
export type ChangePasswordErrors = Partial<Record<keyof z.input<typeof changePasswordSchema>, string>>;
