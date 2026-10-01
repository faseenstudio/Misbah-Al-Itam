import Link from "next/link";
import { CircleCheck, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/components/activity-card";
import { CONTENT_EDITOR_ROLES, requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { ActivityCategory } from "@/generated/prisma/client";

export const metadata = { title: "กิจกรรมและข่าวสาร" };

const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
const CATEGORIES = Object.keys(CATEGORY_LABELS) as ActivityCategory[];

export default async function AdminActivitiesPage({ searchParams }: PageProps<"/admin/activities">) {
  await requireAdmin(CONTENT_EDITOR_ROLES);
  const sp = await searchParams;
  const category = CATEGORIES.includes(sp.category as ActivityCategory) ? (sp.category as ActivityCategory) : undefined;

  const posts = await prisma.activity.findMany({
    where: category ? { category } : {},
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    select: { id: true, title: true, slug: true, category: true, status: true, publishedAt: true, updatedAt: true, progressPercent: true },
  });
  const now = new Date();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">กิจกรรมและข่าวสาร</h1>
          <p className="text-muted-foreground">โพสต์กิจกรรม ข่าวสาร และความคืบหน้าการก่อสร้างบ้านตะเกียง</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/activities/new">
            <Plus />
            เขียนโพสต์ใหม่
          </Link>
        </Button>
      </header>

      {(sp.saved || sp.deleted) && (
        <Alert variant="success">
          <CircleCheck />
          <AlertDescription>{sp.deleted ? "ลบโพสต์แล้ว" : "บันทึกเรียบร้อยแล้ว"}</AlertDescription>
        </Alert>
      )}

      <nav aria-label="ประเภท" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          {[undefined, ...CATEGORIES].map((c) => (
            <li key={c ?? "all"}>
              <Link
                href={c ? `/admin/activities?category=${c}` : "/admin/activities"}
                aria-current={c === category ? "page" : undefined}
                className={cn(
                  "block rounded-full border px-4 py-2 text-sm font-medium",
                  c === category ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-accent",
                )}
              >
                {c ? CATEGORY_LABELS[c] : "ทั้งหมด"}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">ยังไม่มีโพสต์</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
          {posts.map((p) => {
            const scheduled = p.status === "PUBLISHED" && p.publishedAt && p.publishedAt > now;
            return (
              <li key={p.id}>
                <Link href={`/admin/activities/${p.id}`} className="flex flex-col gap-1.5 p-4 hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-primary">{p.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[p.category]}
                      {p.progressPercent != null && ` · ${p.progressPercent}%`} · แก้ไขล่าสุด {dateTime.format(p.updatedAt)}
                    </span>
                  </span>
                  {p.status === "DRAFT" ? (
                    <Badge variant="outline">ฉบับร่าง</Badge>
                  ) : scheduled ? (
                    <Badge variant="warning">ตั้งเวลา {dateTime.format(p.publishedAt!)}</Badge>
                  ) : (
                    <Badge variant="success">เผยแพร่แล้ว</Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
