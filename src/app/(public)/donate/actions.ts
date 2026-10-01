"use server";

import { donationReference } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { deleteSlip, sniffImageType, uploadSlip } from "@/lib/storage";
import {
  donationSchema,
  firstFieldErrors,
  normalizePhone,
  type SubmitDonationResult,
} from "@/lib/validation/donation";


function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitDonation(formData: FormData): Promise<SubmitDonationResult> {
  const parsed = donationSchema.safeParse({
    fundId: text(formData, "fundId"),
    donorName: text(formData, "donorName"),
    donorPhone: text(formData, "donorPhone"),
    isAnonymous: text(formData, "isAnonymous") === "true",
    amount: text(formData, "amount"),
    transferredAt: text(formData, "transferredAt"),
    message: text(formData, "message"),
    slip: formData.get("slip"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: firstFieldErrors(parsed.error) };
  }

  const fund = await prisma.fund.findFirst({
    where: { id: parsed.data.fundId, isActive: true },
    select: { id: true },
  });
  if (!fund) {
    return { ok: false, fieldErrors: { fundId: "ไม่พบกองทุนที่เลือก กรุณาเลือกใหม่" } };
  }

  const { data } = parsed;
  const bytes = new Uint8Array(await data.slip.arrayBuffer());
  const contentType = sniffImageType(bytes);
  if (!contentType) {
    return { ok: false, fieldErrors: { slip: "ไฟล์ไม่ใช่รูปภาพที่ถูกต้อง กรุณาแนบภาพสลิป JPG, PNG หรือ WEBP" } };
  }

  let slipStorageKey: string;
  try {
    slipStorageKey = await uploadSlip(bytes, contentType);
  } catch (error) {
    console.error("[donate] slip upload failed", error);
    return { ok: false, formError: "อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  try {
    const donation = await prisma.donation.create({
      data: {
        fundId: fund.id,
        donorName: data.donorName,
        donorPhone: data.donorPhone ? normalizePhone(data.donorPhone) : null,
        isAnonymous: data.isAnonymous,
        message: data.message || null,
        amount: data.amount.toFixed(2),
        transferredAt: data.transferredAt,
        slipStorageKey,
      },
      select: { id: true },
    });
    return { ok: true, reference: donationReference(donation.id) };
  } catch (error) {
    console.error("[donate] saving donation failed", error);
    // Don't leave an orphaned slip behind.
    await deleteSlip(slipStorageKey).catch(() => {});
    return { ok: false, formError: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}
