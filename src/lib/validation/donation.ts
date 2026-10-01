import { z } from "zod";

/** Shared between the donation form (client) and the submit Server Action (server). */

export const SLIP_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const SLIP_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AMOUNT_MIN = 1;
export const AMOUNT_MAX = 10_000_000;

// Allow a little clock skew between the donor's phone and the server.
const FUTURE_TOLERANCE_MS = 10 * 60 * 1000;

export const normalizePhone = (value: string) => value.replace(/[\s-]/g, "");

export const donationSchema = z.object({
  fundId: z.string().min(1, "กรุณาเลือกกองทุน"),
  donorName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อผู้บริจาค")
    .max(100, "ชื่อยาวเกิน 100 ตัวอักษร"),
  donorPhone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^0\d{8,9}$/.test(normalizePhone(v)), "เบอร์โทรศัพท์ไม่ถูกต้อง เช่น 081-234-5678"),
  isAnonymous: z.boolean(),
  amount: z
    .string()
    .trim()
    .min(1, "กรุณากรอกจำนวนเงิน")
    .pipe(
      z.coerce
        .number<string>({ error: "กรุณากรอกจำนวนเงินเป็นตัวเลข" })
        .min(AMOUNT_MIN, "จำนวนเงินขั้นต่ำ 1 บาท")
        .max(AMOUNT_MAX, "จำนวนเงินเกินกว่าที่ระบบรองรับ กรุณาติดต่อมูลนิธิ")
        // Round to satang before checking to avoid float artefacts (e.g. 0.29 * 100).
        .refine((v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-6, "ระบุทศนิยมได้ไม่เกิน 2 ตำแหน่ง"),
    ),
  transferredAt: z.coerce
    .date({ error: "กรุณาระบุวันและเวลาที่โอน" })
    .refine((d) => d.getTime() <= Date.now() + FUTURE_TOLERANCE_MS, "วันเวลาที่โอนต้องไม่เป็นเวลาในอนาคต"),
  message: z.string().trim().max(500, "ข้อความยาวเกิน 500 ตัวอักษร"),
  slip: z
    .file({ error: "กรุณาแนบสลิปการโอนเงิน" })
    .min(1, "ไฟล์สลิปว่างเปล่า")
    .max(SLIP_MAX_BYTES, "ไฟล์ใหญ่เกิน 5 MB")
    .mime([...SLIP_MIME_TYPES], "รองรับเฉพาะไฟล์ภาพ JPG, PNG หรือ WEBP"),
});

export type DonationInput = z.input<typeof donationSchema>;
export type DonationData = z.output<typeof donationSchema>;
export type DonationField = keyof DonationInput;
export type DonationFieldErrors = Partial<Record<DonationField, string>>;

/** First error message per field. */
export function firstFieldErrors(error: z.ZodError<DonationData>): DonationFieldErrors {
  const flat = z.flattenError(error).fieldErrors as Partial<Record<DonationField, string[]>>;
  const out: DonationFieldErrors = {};
  for (const [key, messages] of Object.entries(flat) as Array<[DonationField, string[] | undefined]>) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out;
}

/** Validate only the slip — used right when a file is picked so the donor gets instant feedback. */
export function validateSlip(file: File): string | undefined {
  const result = donationSchema.shape.slip.safeParse(file);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export type SubmitDonationResult =
  | { ok: true; reference: string }
  | { ok: false; formError?: string; fieldErrors?: DonationFieldErrors };
