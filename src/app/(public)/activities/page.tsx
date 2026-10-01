import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ActivityCard, CATEGORY_LABELS } from "@/components/activity-card";
import { PageHeader } from "@/components/site/page-header";
import { getPublishedActivities } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "กิจกรรมและข่าวสาร",
  description: "กิจกรรมของมูลนิธิตะเกียงเด็กกำพร้า และความคืบหน้าการก่อสร้างโครงการวะกัฟบ้านตะเกียง",
};

const PAGE_SIZE = 9;
type Category = keyof typeof CATEGORY_LABELS;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

function hrefFor(category: Category | undefined, page = 1) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/activities?${qs}` : "/activities";
}

export default async function ActivitiesPage({ searchParams }: PageProps<"/activities">) {
  const sp = await searchParams;
  const rawCategory = typeof sp.category === "string" ? sp.category : undefined;
  const category = CATEGORIES.includes(rawCategory as Category) ? (rawCategory as Category) : undefined;
  const page = Math.max(1, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const { items, total } = await getPublishedActivities({
    category,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs: Array<{ value: Category | undefined; label: string }> = [
    { value: undefined, label: "ทั้งหมด" },
    ...CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
  ];

  return (
    <>
      <PageHeader
        title="กิจกรรมและข่าวสาร"
        description="ผลงานจากความร่วมมือของผู้บริจาคทุกท่าน และความคืบหน้าโครงการวะกัฟบ้านตะเกียง"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <nav aria-label="หมวดหมู่" className="-mx-4 mb-8 overflow-x-auto px-4">
          <ul className="flex w-max gap-2">
            {tabs.map((tab) => {
              const active = tab.value === category;
              return (
                <li key={tab.label}>
                  <Link
                    href={hrefFor(tab.value)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:border-secondary hover:bg-accent",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            ยังไม่มีโพสต์ในหมวดนี้
          </p>
        )}

        {totalPages > 1 && (
          <nav aria-label="หน้า" className="mt-10 flex items-center justify-center gap-3">
            {page > 1 ? (
              <Button asChild variant="outline">
                <Link href={hrefFor(category, page - 1)}>ก่อนหน้า</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>ก่อนหน้า</Button>
            )}
            <span className="text-sm text-muted-foreground">
              หน้า {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Button asChild variant="outline">
                <Link href={hrefFor(category, page + 1)}>ถัดไป</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>ถัดไป</Button>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
