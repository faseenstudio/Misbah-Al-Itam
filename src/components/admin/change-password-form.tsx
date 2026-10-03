"use client";

import { useActionState } from "react";
import { AlertCircle, CircleCheck, KeyRound, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { changeOwnPassword, type ChangePasswordState } from "@/app/admin/(panel)/account/actions";
import { PASSWORD_MIN } from "@/lib/validation/user";
import { FormField, errorAria } from "./form-field";
import { PasswordInput } from "./password-input";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(changeOwnPassword, {});
  const errors = state.errors ?? {};

  return (
    // Remount after success so the password fields clear.
    <form key={state.success ?? "editing"} action={action} className="flex max-w-md flex-col gap-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      {state.success && (
        <Alert variant="success">
          <CircleCheck />
          <AlertDescription>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป</AlertDescription>
        </Alert>
      )}
      {state.formError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <FormField id="currentPassword" label="รหัสผ่านปัจจุบัน" error={errors.currentPassword}>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          required
          autoComplete="current-password"
          {...errorAria("currentPassword", errors.currentPassword)}
        />
      </FormField>
      <FormField id="newPassword" label="รหัสผ่านใหม่" error={errors.newPassword} hint={`อย่างน้อย ${PASSWORD_MIN} ตัวอักษร`}>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          required
          minLength={PASSWORD_MIN}
          maxLength={200}
          autoComplete="new-password"
          {...errorAria("newPassword", errors.newPassword)}
        />
      </FormField>
      <FormField id="confirmPassword" label="ยืนยันรหัสผ่านใหม่" error={errors.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          {...errorAria("confirmPassword", errors.confirmPassword)}
        />
      </FormField>

      <Button type="submit" variant="gold" disabled={pending} className="self-start">
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        เปลี่ยนรหัสผ่าน
      </Button>
    </form>
  );
}
