"use server";

import { prisma } from "@/lib/prisma";
import { donationSchema, firstFieldErrors, type SubmitDonationResult } from "@/lib/validation/donation";

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

  // TODO(step 5): upload parsed.data.slip to private storage and create the PENDING Donation row.
  return {
    ok: false,
    formError: "ระบบรับแจ้งการโอนออนไลน์ยังไม่เปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่ทางโทรศัพท์เพื่อแจ้งการโอนชั่วคราว",
  };
}
