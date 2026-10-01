"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { saveProject, type ProjectFormState } from "@/app/admin/(panel)/projects/actions";
import { ImageUpload } from "./image-upload";

export type ProjectFormValues = {
  id: string;
  title: string;
  summary: string;
  description: string;
  goalAmount: string;
  progressPercent: string;
  coverImageUrl: string;
  fundId: string;
  isFeatured: boolean;
};

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function ProjectForm({ initial, funds }: { initial: ProjectFormValues; funds: Array<{ id: string; nameTh: string }> }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject, {});
  const [v, setV] = useState(initial);
  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => setV((p) => ({ ...p, [key]: value }));
  const e = state.errors ?? {};
  const progress = Math.min(100, Math.max(0, Number(v.progressPercent) || 0));

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <input type="hidden" name="id" value={v.id} />
      <input type="hidden" name="coverImageUrl" value={v.coverImageUrl} />

      {state.formError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <Field id="title" label="ชื่อโครงการ" error={e.title}>
        <Input id="title" name="title" value={v.title} onChange={(x) => set("title", x.target.value)} />
      </Field>
      <Field id="summary" label="คำอธิบายสั้น (แสดงบนหน้าแรก)" error={e.summary}>
        <Textarea id="summary" name="summary" rows={3} maxLength={500} value={v.summary} onChange={(x) => set("summary", x.target.value)} />
      </Field>
      <Field id="description" label="รายละเอียดเพิ่มเติม (ไม่บังคับ)" error={e.description}>
        <Textarea id="description" name="description" rows={6} value={v.description} onChange={(x) => set("description", x.target.value)} />
      </Field>

      <Field
        id="progressPercent"
        label="ความคืบหน้าการก่อสร้าง (%)"
        hint="จะถูกอัปเดตอัตโนมัติเมื่อเผยแพร่โพสต์ความคืบหน้าล่าสุดที่ระบุเปอร์เซ็นต์"
        error={e.progressPercent}
      >
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(x) => set("progressPercent", x.target.value)}
            className="flex-1 accent-[var(--secondary)]"
            aria-label="ความคืบหน้า (แถบเลื่อน)"
          />
          <Input
            id="progressPercent"
            name="progressPercent"
            inputMode="numeric"
            value={v.progressPercent}
            onChange={(x) => set("progressPercent", x.target.value.replace(/\D/g, "").slice(0, 3))}
            className="w-24 text-center"
          />
        </div>
        <Progress value={progress} aria-label="ตัวอย่างแถบความคืบหน้า" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="goalAmount" label="เป้าหมายยอดบริจาค (บาท, ไม่บังคับ)" error={e.goalAmount}>
          <Input id="goalAmount" name="goalAmount" inputMode="decimal" value={v.goalAmount} onChange={(x) => set("goalAmount", x.target.value.replace(/[^\d.]/g, ""))} placeholder="เช่น 5000000" />
        </Field>
        <Field id="fundId" label="นับยอดจากกองทุน" hint="ยอดที่ยืนยันแล้วของกองทุนนี้จะแสดงเทียบกับเป้าหมาย" error={e.fundId}>
          <select
            id="fundId"
            name="fundId"
            value={v.fundId}
            onChange={(x) => set("fundId", x.target.value)}
            className="h-12 rounded-lg border border-input bg-card px-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <option value="">— ไม่ผูกกับกองทุน —</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nameTh}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="cover" label="รูปปกโครงการ" hint="ถ้าไม่ใส่ จะใช้ภาพอาคารบ้านตะเกียงเป็นค่าเริ่มต้น" error={e.coverImageUrl}>
        <ImageUpload id="cover" folder="projects" label="เลือกรูปปก" value={v.coverImageUrl ? [v.coverImageUrl] : []} onChange={(u) => set("coverImageUrl", u[0] ?? "")} />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" name="isFeatured" checked={v.isFeatured} onChange={(x) => set("isFeatured", x.target.checked)} className="size-5 accent-primary" />
        แสดงเป็นโครงการเด่นบนหน้าแรก
      </label>

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        บันทึกโครงการ
      </Button>
    </form>
  );
}
