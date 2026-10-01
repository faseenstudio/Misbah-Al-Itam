import { z } from "zod";

/** Images must come from our own storage (or bundled photos) so next/image can serve them. */
export const MEDIA_URL_PATTERN =
  /^(\/media\/|\/photos\/|https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/)[^\s"'<>]+$/;

export const SLUG_PATTERN = /^[a-z0-9฀-๿]+(?:-[a-z0-9฀-๿]+)*$/;

/** "เทฐานราก บ้านตะเกียง!" → "เทฐานราก-บ้านตะเกียง". Thai letters are kept; browsers display them readably. */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const mediaUrl = z.string().regex(MEDIA_URL_PATTERN, "รูปภาพไม่ถูกต้อง");
const optionalText = (max: number, msg: string) => z.string().trim().max(max, msg);

export const activitySchema = z
  .object({
    title: z.string().trim().min(1, "กรุณาใส่หัวข้อ").max(200, "หัวข้อยาวเกิน 200 ตัวอักษร"),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(100, "ลิงก์ยาวเกิน 100 ตัวอักษร")
      .refine((v) => v === "" || SLUG_PATTERN.test(v), "ใช้ได้เฉพาะตัวอักษร ตัวเลข และขีด (-)"),
    excerpt: optionalText(300, "คำโปรยยาวเกิน 300 ตัวอักษร"),
    content: z.string().trim().min(1, "กรุณาใส่เนื้อหา").max(20000, "เนื้อหายาวเกิน 20,000 ตัวอักษร"),
    category: z.enum(["ACTIVITY", "NEWS", "WAQF_UPDATE"]),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    publishedAt: z.string().trim(), // ISO string from the client, or "" for "now"
    eventDate: z.string().trim().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "วันที่ไม่ถูกต้อง"),
    progressPercent: z.string().trim(),
    coverImageUrl: z.union([z.literal(""), mediaUrl]),
    imageUrls: z.array(mediaUrl).max(30, "แนบรูปได้ไม่เกิน 30 รูป"),
  })
  .transform((v, ctx) => {
    let progress: number | null = null;
    if (v.category === "WAQF_UPDATE" && v.progressPercent !== "") {
      const n = Number(v.progressPercent);
      if (!Number.isInteger(n) || n < 0 || n > 100) {
        ctx.addIssue({ code: "custom", path: ["progressPercent"], message: "ใส่ตัวเลข 0–100" });
        return z.NEVER;
      }
      progress = n;
    }
    let publishedAt: Date | null = null;
    if (v.publishedAt !== "") {
      publishedAt = new Date(v.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) {
        ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "วันเวลาไม่ถูกต้อง" });
        return z.NEVER;
      }
    }
    return {
      ...v,
      excerpt: v.excerpt || null,
      eventDate: v.eventDate ? new Date(`${v.eventDate}T00:00:00+07:00`) : null,
      progressPercent: progress,
      publishedAt,
      coverImageUrl: v.coverImageUrl || null,
    };
  });

export type ActivityFormErrors = Partial<Record<keyof z.input<typeof activitySchema>, string>>;

export const projectSchema = z.object({
  title: z.string().trim().min(1, "กรุณาใส่ชื่อโครงการ").max(200),
  summary: z.string().trim().min(1, "กรุณาใส่คำอธิบายสั้น").max(500, "ยาวเกิน 500 ตัวอักษร"),
  description: optionalText(20000, "ยาวเกินไป"),
  goalAmount: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0), "ใส่จำนวนเงินเป็นตัวเลข เช่น 5000000"),
  progressPercent: z.coerce.number<string>().int("ใส่จำนวนเต็ม").min(0, "ต่ำสุด 0").max(100, "สูงสุด 100"),
  coverImageUrl: z.union([z.literal(""), mediaUrl]),
  fundId: z.string(),
  isFeatured: z.boolean(),
});

export type ProjectFormErrors = Partial<Record<keyof z.input<typeof projectSchema>, string>>;

/** First message per top-level field. */
export function fieldErrors<T extends string>(error: z.ZodError): Partial<Record<T, string>> {
  const out: Partial<Record<T, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "") as T;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
