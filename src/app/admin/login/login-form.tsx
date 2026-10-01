"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/admin"} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} autoFocus />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
