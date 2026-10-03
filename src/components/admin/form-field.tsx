import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";

/** Label + control + error (or hint) — the error id matches the control's aria-describedby. */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** aria attributes linking a control to its FormField error. */
export function errorAria(id: string, error?: string) {
  return error ? ({ "aria-invalid": true, "aria-describedby": `${id}-error` } as const) : {};
}
