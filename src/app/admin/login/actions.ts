"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string; email?: string };

/** Only allow redirects back into the admin panel (no open redirects). */
function safeCallback(value: FormDataEntryValue | null) {
  return typeof value === "string" && /^\/admin(\/|$|\?)/.test(value) ? value : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: safeCallback(formData.get("callbackUrl")),
    });
    return {};
  } catch (error) {
    // signIn redirects by throwing; only swallow genuine auth failures.
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return { error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่", email };
    }
    if (error instanceof AuthError) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", email };
    }
    throw error;
  }
}
