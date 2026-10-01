import Link from "next/link";
import { CircleCheck, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CONTENT_EDITOR_ROLES, requireAdmin } from "@/lib/dal";
import { formatBaht } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "โครงการ" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  await requireAdmin(CONTENT_EDITOR_ROLES);
  const { saved } = await searchParams;
  const projects = await prisma.project.findMany({
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    include: { fund: { select: { nameTh: true } } },
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">โครงการ</h1>
          <p className="text-muted-foreground">อัปเดตความคืบหน้าและเป้าหมายของโครงการวะกัฟ</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/activities/new?category=WAQF_UPDATE">
            <Plus />
            โพสต์อัปเดตความคืบหน้า
          </Link>
        </Button>
      </header>
      {saved && (
        <Alert variant="success">
          <CircleCheck />
          <AlertDescription>บันทึกโครงการเรียบร้อยแล้ว</AlertDescription>
        </Alert>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/projects/${p.id}`} className="flex h-full flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm hover:border-secondary">
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-primary">{p.title}</span>
                {p.isFeatured && <Badge variant="gold">โครงการเด่น</Badge>}
              </span>
              <span className="line-clamp-2 text-sm text-muted-foreground">{p.summary}</span>
              <span className="flex items-center justify-between text-sm">
                <span>ความคืบหน้า</span>
                <span className="font-semibold text-primary">{p.progressPercent}%</span>
              </span>
              <Progress value={p.progressPercent} aria-label={`ความคืบหน้า ${p.title}`} />
              <span className="text-xs text-muted-foreground">
                {p.goalAmount ? `เป้าหมาย ${formatBaht(p.goalAmount)}` : "ไม่ได้ตั้งเป้าหมายยอด"}
                {p.fund && ` · กองทุน${p.fund.nameTh}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
