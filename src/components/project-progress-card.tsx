import Link from "next/link";
import { Hammer, Users } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { getFeaturedProject } from "@/lib/queries";
import { formatBaht, formatThaiDate } from "@/lib/format";

export type FeaturedProjectData = NonNullable<Awaited<ReturnType<typeof getFeaturedProject>>>;

/** Construction progress, funding vs goal, donor count and latest update for a project. */
export function ProjectProgressCard({ project, showLatestUpdate = true }: { project: FeaturedProjectData; showLatestUpdate?: boolean }) {
  const goal = project.goalAmount ? Number(project.goalAmount) : null;
  const fundingPercent = goal ? Math.min(100, Math.round((project.raisedAmount / goal) * 100)) : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium text-primary">
            <Hammer className="size-4" />
            ความคืบหน้าการก่อสร้าง
          </span>
          <span className="font-semibold text-primary">{project.progressPercent}%</span>
        </div>
        <Progress value={project.progressPercent} aria-label="ความคืบหน้าการก่อสร้าง" />
      </div>

      {goal !== null && fundingPercent !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-primary">ยอดบริจาค</span>
            <span className="text-muted-foreground">
              <strong className="text-primary">{formatBaht(project.raisedAmount)}</strong> / {formatBaht(goal)}
            </span>
          </div>
          <Progress value={fundingPercent} indicatorClassName="bg-primary" aria-label="ยอดบริจาคเทียบเป้าหมาย" />
        </div>
      )}

      {project.donationCount > 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          ผู้ร่วมบริจาคแล้ว {project.donationCount.toLocaleString("th-TH")} รายการ
        </p>
      )}

      {showLatestUpdate && project.latestUpdate && (
        <Link href={`/activities/${project.latestUpdate.slug}`} className="rounded-lg bg-muted px-3 py-2 text-sm hover:bg-accent">
          <span className="text-muted-foreground">อัปเดตล่าสุด {formatThaiDate(project.latestUpdate.publishedAt)}: </span>
          <span className="font-medium text-primary">{project.latestUpdate.title}</span>
        </Link>
      )}
    </div>
  );
}
