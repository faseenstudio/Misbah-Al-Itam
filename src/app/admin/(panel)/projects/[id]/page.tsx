import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProjectForm } from "@/components/admin/project-form";
import { CONTENT_EDITOR_ROLES, requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "แก้ไขโครงการ" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin(CONTENT_EDITOR_ROLES);
  const { id } = await params;
  const [project, funds] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.fund.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameTh: true } }),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/projects" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายการโครงการ
      </Link>
      <h1 className="text-2xl font-bold text-primary">แก้ไขโครงการ</h1>
      <ProjectForm
        funds={funds}
        initial={{
          id: project.id,
          title: project.title,
          summary: project.summary,
          description: project.description ?? "",
          goalAmount: project.goalAmount ? project.goalAmount.toString() : "",
          progressPercent: String(project.progressPercent),
          coverImageUrl: project.coverImageUrl ?? "",
          fundId: project.fundId ?? "",
          isFeatured: project.isFeatured,
        }}
      />
    </div>
  );
}
