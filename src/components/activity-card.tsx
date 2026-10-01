import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ActivitySummary } from "@/lib/queries";
import { formatThaiDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const CATEGORY_LABELS = {
  ACTIVITY: "กิจกรรม",
  NEWS: "ข่าวสาร",
  WAQF_UPDATE: "ความคืบหน้าบ้านตะเกียง",
} as const;

export function ActivityCard({ activity, className }: { activity: ActivitySummary; className?: string }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[16/10] bg-muted">
        {activity.coverImageUrl ? (
          <Image
            src={activity.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 text-primary/40">
            <ImageIcon className="size-10" />
          </div>
        )}
        <Badge variant={activity.category === "WAQF_UPDATE" ? "gold" : "default"} className="absolute top-3 left-3">
          {CATEGORY_LABELS[activity.category]}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <time dateTime={activity.publishedAt?.toISOString()}>{formatThaiDate(activity.publishedAt)}</time>
        </p>
        <h3 className="line-clamp-2 text-lg font-semibold text-primary">
          <Link href={`/activities/${activity.slug}`} className="after:absolute after:inset-0">
            {activity.title}
          </Link>
        </h3>
        {activity.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{activity.excerpt}</p>}
        {activity.category === "WAQF_UPDATE" && activity.progressPercent != null && (
          <p className="mt-auto pt-2 text-sm font-medium text-primary">
            ความคืบหน้าการก่อสร้าง {activity.progressPercent}%
          </p>
        )}
      </div>
    </article>
  );
}
