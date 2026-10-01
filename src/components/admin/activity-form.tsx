"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AlertCircle, Eye, Loader2, Save, Send } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveActivity, type ActivityFormState } from "@/app/admin/(panel)/activities/actions";
import { slugify } from "@/lib/validation/content";
import { cn } from "@/lib/utils";
import { ImageUpload } from "./image-upload";

export type ActivityFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "ACTIVITY" | "NEWS" | "WAQF_UPDATE";
  status: "DRAFT" | "PUBLISHED";
  /** datetime-local value in Thailand time (YYYY-MM-DDTHH:mm), or "" */
  publishedAt: string;
  eventDate: string;
  progressPercent: string;
  coverImageUrl: string;
  imageUrls: string[];
};

const CATEGORIES = [
  { value: "ACTIVITY", label: "กิจกรรม" },
  { value: "NEWS", label: "ข่าวสาร" },
  { value: "WAQF_UPDATE", label: "ความคืบหน้าบ้านตะเกียง" },
] as const;

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
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

export function ActivityForm({ initial, projectProgress }: { initial: ActivityFormValues; projectProgress: number | null }) {
  const [state, action, pending] = useActionState<ActivityFormState, FormData>(saveActivity, {});
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const set = <K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const errors = state.errors ?? {};
  const aria = (key: keyof typeof errors) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});

  const slugPreview = v.slug || slugify(v.title) || "…";
  const isWaqf = v.category === "WAQF_UPDATE";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Hidden fields carry derived / non-input values */}
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="category" value={v.category} />
      <input type="hidden" name="coverImageUrl" value={v.coverImageUrl} />
      <input type="hidden" name="imageUrls" value={JSON.stringify(v.imageUrls)} />
      {/* Times are edited in Thailand time (UTC+7, no DST) so server and browser agree */}
      <input type="hidden" name="publishedAt" value={v.publishedAt ? `${v.publishedAt}:00+07:00` : ""} />

      <div className="flex flex-col gap-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        {state.formError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{state.formError}</AlertDescription>
          </Alert>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-primary">ประเภท</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60",
                  v.category === c.value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-accent",
                )}
              >
                <input
                  type="radio"
                  name="category-choice"
                  value={c.value}
                  checked={v.category === c.value}
                  onChange={() => set("category", c.value)}
                  className="sr-only"
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field id="title" label="หัวข้อ" error={errors.title}>
          <Input
            id="title"
            name="title"
            value={v.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", "");
            }}
            placeholder="เช่น เทฐานรากอาคารบ้านตะเกียงแล้วเสร็จ"
            {...aria("title")}
          />
        </Field>

        <Field id="excerpt" label="คำโปรย (ไม่บังคับ)" hint="แสดงบนการ์ดในหน้ารวมกิจกรรม 1–2 ประโยค" error={errors.excerpt}>
          <Textarea id="excerpt" name="excerpt" rows={2} maxLength={300} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} {...aria("excerpt")} />
        </Field>

        <Field id="content" label="เนื้อหา" hint="เว้นบรรทัดว่างหนึ่งบรรทัดเพื่อขึ้นย่อหน้าใหม่" error={errors.content}>
          <Textarea id="content" name="content" rows={12} value={v.content} onChange={(e) => set("content", e.target.value)} {...aria("content")} />
        </Field>

        {isWaqf && (
          <Field
            id="progressPercent"
            label="ความคืบหน้าการก่อสร้าง ณ วันที่โพสต์ (%)"
            hint={`ถ้าเป็นอัปเดตล่าสุด แถบความคืบหน้าบนหน้าแรกจะเปลี่ยนตามค่านี้${projectProgress != null ? ` (ตอนนี้ ${projectProgress}%)` : ""}`}
            error={errors.progressPercent}
          >
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={v.progressPercent || "0"}
                onChange={(e) => set("progressPercent", e.target.value)}
                className="flex-1 accent-[var(--secondary)]"
                aria-label="ความคืบหน้า (แถบเลื่อน)"
              />
              <Input
                id="progressPercent"
                name="progressPercent"
                inputMode="numeric"
                value={v.progressPercent}
                onChange={(e) => set("progressPercent", e.target.value.replace(/\D/g, "").slice(0, 3))}
                className="w-24 text-center"
                {...aria("progressPercent")}
              />
            </div>
          </Field>
        )}

        <Field id="cover" label="รูปปก" error={errors.coverImageUrl}>
          <ImageUpload
            id="cover"
            label="เลือกรูปปก"
            value={v.coverImageUrl ? [v.coverImageUrl] : []}
            onChange={(urls) => set("coverImageUrl", urls[0] ?? "")}
          />
        </Field>

        <Field id="gallery" label="อัลบั้มรูป (ไม่บังคับ)" hint="เลือกได้หลายรูปพร้อมกัน รูปจะถูกย่อขนาดอัตโนมัติ" error={errors.imageUrls}>
          <ImageUpload id="gallery" label="เพิ่มรูป" multiple value={v.imageUrls} onChange={(urls) => set("imageUrls", urls)} />
        </Field>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-6">
          <p className="text-sm">
            สถานะ:{" "}
            <span className="font-semibold text-primary">{v.status === "PUBLISHED" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</span>
          </p>
          <Button type="submit" name="status" value="PUBLISHED" variant="gold" size="lg" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            {v.status === "PUBLISHED" ? "บันทึกการแก้ไข" : "เผยแพร่"}
          </Button>
          <Button type="submit" name="status" value="DRAFT" variant="outline" disabled={pending}>
            <Save />
            {v.status === "PUBLISHED" ? "ยกเลิกเผยแพร่ (เก็บเป็นร่าง)" : "บันทึกฉบับร่าง"}
          </Button>
          {v.id && v.status === "PUBLISHED" && (
            <Button asChild variant="ghost" size="sm">
              <a href={`/activities/${encodeURIComponent(v.slug)}`} target="_blank" rel="noopener noreferrer">
                <Eye />
                ดูหน้าเว็บ
              </a>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-sm">
          <Field id="publishedAt-input" label="วันเวลาเผยแพร่ (เวลาประเทศไทย)" hint="เว้นว่าง = เผยแพร่ทันที · ตั้งเวลาล่วงหน้าได้" error={errors.publishedAt}>
            <Input id="publishedAt-input" type="datetime-local" value={v.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
          </Field>
          <Field id="eventDate" label="วันที่จัดกิจกรรม (ไม่บังคับ)" error={errors.eventDate}>
            <Input id="eventDate" name="eventDate" type="date" value={v.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
          </Field>
          <Field id="slug" label="ลิงก์ของโพสต์" hint={`/activities/${slugPreview}`} error={errors.slug}>
            <Input
              id="slug"
              name="slug"
              value={v.slug}
              placeholder={slugify(v.title) || "สร้างจากหัวข้ออัตโนมัติ"}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              {...aria("slug")}
            />
          </Field>
        </div>
      </aside>
    </form>
  );
}
