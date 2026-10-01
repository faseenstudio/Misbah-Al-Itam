import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ActivityForm } from "@/components/admin/activity-form";
import { CONTENT_EDITOR_ROLES, requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "เขียนโพสต์ใหม่" };

export default async function NewActivityPage({ searchParams }: PageProps<"/admin/activities/new">) {
  await requireAdmin(CONTENT_EDITOR_ROLES);
  const { category } = await searchParams;
  const project = await prisma.project.findFirst({ where: { isFeatured: true }, select: { progressPercent: true } });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/activities" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายการโพสต์
      </Link>
      <h1 className="text-2xl font-bold text-primary">เขียนโพสต์ใหม่</h1>
      <ActivityForm
        projectProgress={project?.progressPercent ?? null}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: category === "WAQF_UPDATE" || category === "NEWS" ? category : "ACTIVITY",
          status: "DRAFT",
          publishedAt: "",
          eventDate: "",
          progressPercent: category === "WAQF_UPDATE" && project ? String(project.progressPercent) : "",
          coverImageUrl: "",
          imageUrls: [],
        }}
      />
    </div>
  );
}
