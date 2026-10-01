"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { DONATION_REVIEWER_ROLES, authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type ReviewState = { error?: string };

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ id: z.string().min(1), decision: z.literal("APPROVED"), note: z.string().trim().max(500).optional() }),
  z.object({
    id: z.string().min(1),
    decision: z.literal("REJECTED"),
    note: z.string().trim().min(1, "กรุณาระบุเหตุผลที่ไม่ผ่าน").max(500),
  }),
]);

export async function reviewDonation(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await authorizeAdmin(DONATION_REVIEWER_ROLES);
  if (!admin) return { error: "คุณไม่มีสิทธิ์ตรวจสอบการบริจาค" };

  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const { id, decision, note } = parsed.data;

  // Only a PENDING donation can be decided — guards against two admins reviewing at once.
  const { count } = await prisma.donation.updateMany({
    where: { id, status: "PENDING" },
    data: { status: decision, reviewNote: note || null, reviewedAt: new Date(), reviewedById: admin.id },
  });
  if (count === 0) return { error: "รายการนี้ถูกตรวจสอบไปแล้ว กรุณารีเฟรชหน้า" };

  redirect(`/admin/donations?status=PENDING&done=${decision === "APPROVED" ? "approved" : "rejected"}`);
}

/** Undo a decision made by mistake: send the donation back to the review queue. */
export async function reopenDonation(formData: FormData) {
  const admin = await authorizeAdmin(DONATION_REVIEWER_ROLES);
  const id = formData.get("id");
  if (!admin || typeof id !== "string") return;

  await prisma.donation.updateMany({
    where: { id, status: { in: ["APPROVED", "REJECTED"] } },
    data: { status: "PENDING", reviewedAt: null, reviewedById: null, reviewNote: null },
  });
  redirect(`/admin/donations/${id}`);
}
