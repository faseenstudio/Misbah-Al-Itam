import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, HeartHandshake, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { getFeaturedProject } from "@/lib/queries";
import { FOUNDATION } from "@/lib/constants";
import { formatBaht, formatThaiDate } from "@/lib/format";
import buildingPhoto from "../../../public/photos/baan-takiang-building.jpg";

type FeaturedProject = NonNullable<Awaited<ReturnType<typeof getFeaturedProject>>>;

export function FeaturedProject({ project }: { project: FeaturedProject }) {
  const goal = project.goalAmount ? Number(project.goalAmount) : null;
  const fundingPercent = goal ? Math.min(100, Math.round((project.raisedAmount / goal) * 100)) : null;
  const donateHref = project.fund ? `/donate?fund=${project.fund.slug}` : "/donate";

  return (
    <section id="waqf" className="scroll-mt-20 bg-accent/60 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary shadow-lg">
          <Image
            src={project.coverImageUrl ?? buildingPhoto}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          <span className="absolute top-4 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow">
            โครงการเด่น · วะกัฟ
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">{project.title}</h2>
          <p className="flex items-center gap-1.5 text-sm font-medium text-gold-deep">
            <MapPin className="size-4" />
            {FOUNDATION.baanTakiangLocation}
          </p>
          <p className="text-muted-foreground">{project.summary}</p>

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
                <div className="flex items-center justify-between text-sm">
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

            {project.latestUpdate && (
              <Link
                href={`/activities/${project.latestUpdate.slug}`}
                className="rounded-lg bg-muted px-3 py-2 text-sm hover:bg-accent"
              >
                <span className="text-muted-foreground">อัปเดตล่าสุด {formatThaiDate(project.latestUpdate.publishedAt)}: </span>
                <span className="font-medium text-primary">{project.latestUpdate.title}</span>
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href={donateHref}>
                <HeartHandshake />
                ร่วมวะกัฟบ้านตะเกียง
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/activities?category=WAQF_UPDATE">
                ติดตามความคืบหน้า
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
