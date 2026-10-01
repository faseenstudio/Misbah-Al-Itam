import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { ActivitySummary } from "@/lib/queries";

export function RecentActivities({ activities }: { activities: ActivitySummary[] }) {
  return (
    <section id="activities" className="bg-muted/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="กิจกรรมล่าสุด"
            title="ผลงานจากความร่วมมือของทุกท่าน"
            description="ติดตามกิจกรรมของมูลนิธิ และความคืบหน้าการก่อสร้างบ้านตะเกียง"
          />
          {activities.length > 0 && (
            <Button asChild variant="outline">
              <Link href="/activities">
                ดูทั้งหมด
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>

        {activities.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            ยังไม่มีกิจกรรมที่เผยแพร่ ติดตามข่าวสารได้เร็ว ๆ นี้
          </p>
        )}
      </div>
    </section>
  );
}
