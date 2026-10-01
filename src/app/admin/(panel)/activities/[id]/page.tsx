import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ActivityForm } from "@/components/admin/activity-form";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CONTENT_EDITOR_ROLES, requireAdmin } from "@/lib/dal";
import { toBangkokDateValue, toBangkokInputValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { deleteActivity } from "../actions";

export const metadata = { title: "แก้ไขโพสต์" };

export default async function EditActivityPage({ params }: PageProps<"/admin/activities/[id]">) {
  await requireAdmin(CONTENT_EDITOR_ROLES);
  const { id } = await params;
  const post = await prisma.activity.findUnique({ where: { id }, include: { project: { select: { progressPercent: true } } } });
  if (!post) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/activities" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายการโพสต์
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">แก้ไขโพสต์</h1>
        <form action={deleteActivity}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmDeleteButton message={`ลบโพสต์ “${post.title}” และรูปทั้งหมด? การลบไม่สามารถย้อนกลับได้`} label="ลบโพสต์" />
        </form>
      </div>
      <ActivityForm
        projectProgress={post.project?.progressPercent ?? null}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          category: post.category,
          status: post.status,
          publishedAt: toBangkokInputValue(post.publishedAt),
          eventDate: toBangkokDateValue(post.eventDate),
          progressPercent: post.progressPercent != null ? String(post.progressPercent) : "",
          coverImageUrl: post.coverImageUrl ?? "",
          imageUrls: post.imageUrls,
        }}
      />
    </div>
  );
}
