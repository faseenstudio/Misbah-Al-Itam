import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, HeartHandshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_LABELS } from "@/components/activity-card";
import { PageHeader } from "@/components/site/page-header";
import { getActivityBySlug } from "@/lib/queries";
import { formatThaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/activities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return {};
  return {
    title: activity.title,
    description: activity.excerpt ?? undefined,
    openGraph: activity.coverImageUrl ? { images: [activity.coverImageUrl] } : undefined,
  };
}

export default async function ActivityPage({ params }: PageProps<"/activities/[slug]">) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();

  // Content is stored as plain text; blank lines separate paragraphs.
  const paragraphs = activity.content.split(/\n\s*\n/).filter(Boolean);
  const isWaqfUpdate = activity.category === "WAQF_UPDATE";

  return (
    <>
      <PageHeader title={activity.title}>
        <Link
          href={isWaqfUpdate ? "/waqf" : "/activities"}
          className="flex w-fit items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          {isWaqfUpdate ? "โครงการบ้านตะเกียง" : "กิจกรรมและข่าวสาร"}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <Badge variant={isWaqfUpdate ? "gold" : "soft"}>{CATEGORY_LABELS[activity.category]}</Badge>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <time dateTime={activity.publishedAt?.toISOString()}>{formatThaiDate(activity.publishedAt)}</time>
          </span>
        </div>
      </PageHeader>

      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        {activity.coverImageUrl && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-sm">
            <Image src={activity.coverImageUrl} alt="" fill priority sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
          </div>
        )}

        {isWaqfUpdate && activity.progressPercent != null && (
          <div className="mb-8 flex flex-col gap-2 rounded-xl border bg-accent/60 p-5">
            <div className="flex items-center justify-between text-sm font-medium text-primary">
              <span>ความคืบหน้าการก่อสร้าง ณ วันที่โพสต์</span>
              <span>{activity.progressPercent}%</span>
            </div>
            <Progress value={activity.progressPercent} aria-label="ความคืบหน้าการก่อสร้าง" />
          </div>
        )}

        <div className="flex flex-col gap-5 text-base text-foreground/90 sm:text-lg">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {activity.imageUrls.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {activity.imageUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={url} alt="" fill sizes="(min-width: 640px) 240px, 50vw" className="object-cover transition-transform hover:scale-105" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">ร่วมเป็นส่วนหนึ่งของงานนี้ได้ด้วยการบริจาค</p>
          <Button asChild variant="gold">
            <Link href={isWaqfUpdate ? "/donate?fund=waqf" : "/donate"}>
              <HeartHandshake />
              บริจาคเลย
            </Link>
          </Button>
        </div>
      </article>
    </>
  );
}
