"use server";

import { redirect } from "next/navigation";

import { CONTENT_EDITOR_ROLES, authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { deleteMediaByUrl } from "@/lib/storage";
import { fieldErrors, projectSchema, type ProjectFormErrors } from "@/lib/validation/content";

export type ProjectFormState = { errors?: ProjectFormErrors; formError?: string };

export async function saveProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const admin = await authorizeAdmin(CONTENT_EDITOR_ROLES);
  if (!admin) return { formError: "คุณไม่มีสิทธิ์แก้ไขโครงการ" };

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.project.findUnique({ where: { id }, select: { coverImageUrl: true } });
  if (!existing) return { formError: "ไม่พบโครงการ" };

  const parsed = projectSchema.safeParse({
    title: formData.get("title") ?? "",
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    goalAmount: formData.get("goalAmount") ?? "",
    progressPercent: formData.get("progressPercent") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    fundId: formData.get("fundId") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  if (v.fundId && !(await prisma.fund.findUnique({ where: { id: v.fundId }, select: { id: true } }))) {
    return { errors: { fundId: "ไม่พบกองทุน" } };
  }

  await prisma.$transaction(async (tx) => {
    // Only one project is highlighted on the home page.
    if (v.isFeatured) await tx.project.updateMany({ where: { NOT: { id } }, data: { isFeatured: false } });
    await tx.project.update({
      where: { id },
      data: {
        title: v.title,
        summary: v.summary,
        description: v.description || null,
        goalAmount: v.goalAmount || null,
        progressPercent: v.progressPercent,
        coverImageUrl: v.coverImageUrl || null,
        fundId: v.fundId || null,
        isFeatured: v.isFeatured,
      },
    });
  });

  if (existing.coverImageUrl && existing.coverImageUrl !== (v.coverImageUrl || null)) {
    await deleteMediaByUrl(existing.coverImageUrl).catch(() => {});
  }
  redirect(`/admin/projects?saved=${id}`);
}
