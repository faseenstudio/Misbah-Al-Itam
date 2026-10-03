"use client";

import { startTransition, useActionState, useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser, updateUser, type UserFormState } from "@/app/admin/(panel)/users/actions";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";
import { PASSWORD_MIN } from "@/lib/validation/user";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma/enums";
import { FormField, errorAria } from "./form-field";
import { PasswordInput } from "./password-input";

export type UserFormValues = { id?: string; name: string; email: string; role: Role; isActive: boolean };

export function UserForm({ initial, isSelf = false }: { initial: UserFormValues; isSelf?: boolean }) {
  const isNew = !initial.id;
  const [state, action, pending] = useActionState<UserFormState, FormData>(isNew ? createUser : updateUser, {});
  // Controlled so a failed submit doesn't clear what was typed.
  const [v, setV] = useState(initial);
  const errors = state.errors ?? {};

  return (
    <form
      // Submitting via onSubmit (not the action prop) skips React's automatic form reset,
      // which would snap the controlled radios/checkbox back to their initial DOM state.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="flex max-w-2xl flex-col gap-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      {state.formError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="ชื่อที่แสดง" error={errors.name}>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            autoComplete="off"
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
            {...errorAria("name", errors.name)}
          />
        </FormField>
        <FormField id="email" label="อีเมล (ใช้เข้าสู่ระบบ)" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            value={v.email}
            onChange={(e) => setV({ ...v, email: e.target.value })}
            {...errorAria("email", errors.email)}
          />
        </FormField>
      </div>

      {/* Outside the fieldset: a disabled fieldset submits none of its fields. */}
      {isSelf && <input type="hidden" name="role" value={v.role} />}
      <fieldset className="flex flex-col gap-3" disabled={isSelf} {...errorAria("role", errors.role)}>
        <legend className="mb-1 text-sm font-medium">สิทธิ์การใช้งาน</legend>
        {ROLES.map((role) => (
          <label
            key={role}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70",
              v.role === role ? "border-secondary bg-accent/60" : "hover:bg-accent/30",
            )}
          >
            <input
              type="radio"
              name="role"
              value={role}
              checked={v.role === role}
              onChange={() => setV({ ...v, role })}
              className="mt-1 size-4 accent-primary"
            />
            <span className="flex flex-col">
              <span className="font-medium text-primary">{ROLE_LABELS[role]}</span>
              <span className="text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</span>
            </span>
          </label>
        ))}
        {errors.role ? (
          <p id="role-error" className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {errors.role}
          </p>
        ) : (
          isSelf && <p className="text-xs text-muted-foreground">เปลี่ยนสิทธิ์ของตัวเองไม่ได้ ให้ผู้ดูแลสูงสุดคนอื่นเปลี่ยนให้</p>
        )}
      </fieldset>

      {!isNew && (
        <div className="flex flex-col gap-2">
          <label className={cn("flex items-center gap-3 text-sm font-medium", isSelf && "opacity-70")}>
            <input
              type="checkbox"
              name="isActive"
              checked={v.isActive}
              disabled={isSelf}
              onChange={(e) => setV({ ...v, isActive: e.target.checked })}
              className="size-4 accent-primary"
            />
            เปิดใช้งานบัญชีนี้
          </label>
          {isSelf && <input type="hidden" name="isActive" value="on" />}
          {errors.isActive ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errors.isActive}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">ปิดการใช้งานแล้ว บัญชีนี้จะถูกออกจากระบบทันทีและเข้าสู่ระบบไม่ได้</p>
          )}
        </div>
      )}

      {isSelf ? (
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          เปลี่ยนรหัสผ่านของตัวเองได้ที่เมนู <strong>บัญชีของฉัน</strong>
        </p>
      ) : (
        <FormField
          id="password"
          label={isNew ? "รหัสผ่านเริ่มต้น" : "ตั้งรหัสผ่านใหม่ (ไม่บังคับ)"}
          error={errors.password}
          hint={
            isNew
              ? `อย่างน้อย ${PASSWORD_MIN} ตัวอักษร แจ้งให้เจ้าของบัญชีเปลี่ยนเองหลังเข้าสู่ระบบครั้งแรก`
              : "เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน ใช้เมื่อเจ้าของบัญชีลืมรหัสผ่าน"
          }
        >
          <PasswordInput
            id="password"
            name="password"
            required={isNew}
            minLength={PASSWORD_MIN}
            maxLength={200}
            autoComplete="new-password"
            generate
            {...errorAria("password", errors.password)}
          />
        </FormField>
      )}

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {isNew ? "เพิ่มผู้ดูแล" : "บันทึก"}
        </Button>
      </div>
    </form>
  );
}
