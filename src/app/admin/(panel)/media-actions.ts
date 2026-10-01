"use server";

import { CONTENT_EDITOR_ROLES, authorizeAdmin } from "@/lib/dal";
import { sniffImageType, uploadMedia } from "@/lib/storage";

const MAX_BYTES = 4 * 1024 * 1024; // images are resized in the browser first; Vercel caps bodies at 4.5 MB

export type UploadMediaResult = { ok: true; url: string } | { ok: false; error: string };

/** Upload one public image (activity / project photo). Called once per file by the editor. */
export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  const admin = await authorizeAdmin(CONTENT_EDITOR_ROLES);
  if (!admin) return { ok: false, error: "ไม่มีสิทธิ์อัปโหลด" };

  const file = formData.get("file");
  const folder = formData.get("folder") === "projects" ? "projects" : "activities";
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "ไม่พบไฟล์" };
  if (file.size > MAX_BYTES) return { ok: false, error: "ไฟล์ใหญ่เกิน 4 MB" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, error: "รองรับเฉพาะรูป JPG, PNG หรือ WEBP" };

  try {
    return { ok: true, url: await uploadMedia(bytes, type, folder) };
  } catch (error) {
    console.error("[admin] media upload failed", error);
    return { ok: false, error: "อัปโหลดไม่สำเร็จ กรุณาลองใหม่" };
  }
}
