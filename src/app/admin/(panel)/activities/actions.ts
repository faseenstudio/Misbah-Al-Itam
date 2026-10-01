"use server";

import { redirect } from "next/navigation";

import { CONTENT_EDITOR_ROLES, authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { deleteMediaByUrl } from "@/lib/storage";
import { activitySchema, fieldErrors, slugify, type ActivityFormErrors } from "@/lib/validation/content";
import { Prisma } from "@/generated/prisma/client";

export type ActivityFormState = { errors?: ActivityFormErrors; formError?: string };

function parseUrls(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(typeof value === "string" ? value : "[]");
  } catch {
    return [];
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = base || `post-${new Date().toISOString().slice(0, 10)}`;
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    const taken = await prisma.activity.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/** Media the post no longer references — removed from storage after a successful save. */
function droppedMedia(before: Array<string | null>, after: Array<string | null>) {
  const keep = new Set(after.filter(Boolean));
  return before.filter((u): u is string => Boolean(u) && !keep.has(u));
}

/**
 * A published construction update moves the project's progress bar, but only when it is
 * the newest published update — editing an old post must not roll progress backwards.
 */
async function syncProjectProgress(projectId: string, onlyIfLatestIs?: string) {
  const latest = await prisma.activity.findFirst({
    where: { projectId, category: "WAQF_UPDATE", status: "PUBLISHED", progressPercent: { not: null }, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, progressPercent: true },
  });
  if (onlyIfLatestIs && latest?.id !== onlyIfLatestIs) return;
  if (latest?.progressPercent != null) {
    await prisma.project.update({ where: { id: projectId }, data: { progressPercent: latest.progressPercent } });
  }
}

export async function saveActivity(_prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const admin = await authorizeAdmin(CONTENT_EDITOR_ROLES);
  if (!admin) return { formError: "คุณไม่มีสิทธิ์แก้ไขเนื้อหา" };

  const id = typeof formData.get("id") === "string" && formData.get("id") !== "" ? String(formData.get("id")) : undefined;
  const parsed = activitySchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    category: formData.get("category"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    progressPercent: formData.get("progressPercent") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    imageUrls: parseUrls(formData.get("imageUrls")),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const existing = id
    ? await prisma.activity.findUnique({ where: { id }, select: { coverImageUrl: true, imageUrls: true, projectId: true, publishedAt: true } })
    : null;
  if (id && !existing) return { formError: "ไม่พบโพสต์นี้ อาจถูกลบไปแล้ว" };

  // Construction updates belong to the featured Waqf project.
  const projectId =
    v.category === "WAQF_UPDATE"
      ? (existing?.projectId ??
        (await prisma.project.findFirst({ where: { isFeatured: true }, orderBy: { updatedAt: "desc" }, select: { id: true } }))?.id ??
        null)
      : null;

  const publishedAt =
    v.status === "PUBLISHED" ? (v.publishedAt ?? existing?.publishedAt ?? new Date()) : (v.publishedAt ?? null);

  const data = {
    title: v.title,
    slug: await uniqueSlug(v.slug || slugify(v.title), id),
    excerpt: v.excerpt,
    content: v.content,
    category: v.category,
    status: v.status,
    publishedAt,
    eventDate: v.eventDate,
    progressPercent: v.progressPercent,
    coverImageUrl: v.coverImageUrl,
    imageUrls: v.imageUrls,
    projectId,
  };

  let savedId: string;
  try {
    savedId = id
      ? (await prisma.activity.update({ where: { id }, data, select: { id: true } })).id
      : (await prisma.activity.create({ data: { ...data, authorId: admin.id }, select: { id: true } })).id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { slug: "ลิงก์นี้ถูกใช้แล้ว กรุณาเปลี่ยน" } };
    }
    console.error("[admin] save activity failed", error);
    return { formError: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }

  if (existing) {
    for (const url of droppedMedia([existing.coverImageUrl, ...existing.imageUrls], [data.coverImageUrl, ...data.imageUrls])) {
      await deleteMediaByUrl(url).catch(() => {});
    }
  }
  if (projectId) await syncProjectProgress(projectId, savedId);

  redirect(`/admin/activities?saved=${savedId}`);
}

export async function deleteActivity(formData: FormData) {
  const admin = await authorizeAdmin(CONTENT_EDITOR_ROLES);
  const id = formData.get("id");
  if (!admin || typeof id !== "string") return;

  const post = await prisma.activity.findUnique({ where: { id }, select: { coverImageUrl: true, imageUrls: true, projectId: true } });
  if (!post) redirect("/admin/activities");

  await prisma.activity.delete({ where: { id } });
  for (const url of [post.coverImageUrl, ...post.imageUrls]) {
    if (url) await deleteMediaByUrl(url).catch(() => {});
  }
  if (post.projectId) await syncProjectProgress(post.projectId);
  redirect("/admin/activities?deleted=1");
}
