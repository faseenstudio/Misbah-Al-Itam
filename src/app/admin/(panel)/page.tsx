import Link from "next/link";
import { ArrowRight, CalendarRange, CircleCheck, CircleX, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FundIcon } from "@/components/fund-icon";
import { getDashboardStats, listDonations } from "@/lib/admin-queries";
import { DONATION_REVIEWER_ROLES, requireAdmin } from "@/lib/dal";
import { donationReference, formatBaht } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "ภาพรวม" };

const monthLabel = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Clock;
  tone?: "default" | "attention";
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("size-5", tone === "attention" ? "text-gold-deep" : "text-primary/50")} />
      </div>
      <span className="font-heading text-2xl font-bold text-primary tabular-nums sm:text-3xl">{value}</span>
      <span className="text-sm text-muted-foreground">{sub}</span>
    </>
  );
  const className = cn(
    "flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm",
    tone === "attention" && "border-secondary bg-accent/60",
    href && "transition-colors hover:border-secondary focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none",
  );
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const canReview = DONATION_REVIEWER_ROLES.includes(admin.role);
  const [stats, pending] = await Promise.all([
    getDashboardStats(),
    canReview ? listDonations({ status: "PENDING", page: 1 }) : null,
  ]);
  const maxFund = Math.max(1, ...stats.perFund.map((f) => f.approvedAmount));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-primary">ภาพรวมการบริจาค</h1>
        <p className="text-muted-foreground">สวัสดี {admin.name} · ยอดทั้งหมดนับเฉพาะรายการที่ตรวจสอบและยืนยันแล้ว</p>
      </header>

      <section aria-label="สรุปยอด" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="รอตรวจสอบ"
          value={`${stats.pendingCount.toLocaleString("th-TH")} รายการ`}
          sub={`รวม ${formatBaht(stats.pendingTotal)}`}
          icon={Clock}
          tone={stats.pendingCount > 0 ? "attention" : "default"}
          href={canReview ? "/admin/donations?status=PENDING" : undefined}
        />
        <StatTile
          label="ยอดยืนยันแล้วทั้งหมด"
          value={formatBaht(stats.approvedTotal)}
          sub={`${stats.approvedCount.toLocaleString("th-TH")} รายการ`}
          icon={CircleCheck}
        />
        <StatTile
          label={`ยอดเดือน${monthLabel.format(stats.monthStart)}`}
          value={formatBaht(stats.monthTotal)}
          sub={`${stats.monthCount.toLocaleString("th-TH")} รายการ (ตามวันที่โอน)`}
          icon={CalendarRange}
        />
        <StatTile
          label="ไม่ผ่านการตรวจสอบ"
          value={`${stats.rejectedCount.toLocaleString("th-TH")} รายการ`}
          sub="สลิปที่ถูกปฏิเสธ"
          icon={CircleX}
        />
      </section>

      <section aria-labelledby="by-fund" className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1">
          <h2 id="by-fund" className="text-lg font-semibold text-primary">
            ยอดยืนยันแล้ว แยกตามกองทุน
          </h2>
          <p className="text-sm text-muted-foreground">ชี้หรือแตะที่แถบเพื่อดูรายละเอียด</p>
        </div>
        <ul className="flex flex-col gap-4">
          {stats.perFund.map((fund) => {
            const share = stats.approvedTotal > 0 ? (fund.approvedAmount / stats.approvedTotal) * 100 : 0;
            const width = (fund.approvedAmount / maxFund) * 100;
            return (
              <li
                key={fund.id}
                tabIndex={0}
                className="group relative grid gap-1.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-4"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FundIcon slug={fund.slug} className="size-4 text-primary/60" />
                  {fund.nameTh}
                </span>
                <span className="relative h-3 rounded-sm bg-muted" aria-hidden="true">
                  {fund.approvedAmount > 0 && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-[4px] bg-primary transition-colors group-hover:bg-primary/85"
                      style={{ width: `max(${width}%, 4px)` }}
                    />
                  )}
                </span>
                <span className="text-sm tabular-nums sm:text-right">
                  <span className="font-semibold text-primary">{formatBaht(fund.approvedAmount)}</span>
                  <span className="ml-2 text-muted-foreground">{share.toFixed(0)}%</span>
                </span>
                {/* Hover / focus tooltip */}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute top-full left-0 z-10 mt-1 hidden w-max max-w-[calc(100vw-3rem)] rounded-lg border bg-popover px-3 py-2 text-xs shadow-md group-hover:block group-focus-visible:block sm:left-[236px]"
                >
                  <span className="block font-semibold text-primary">{fund.nameTh}</span>
                  <span className="block text-muted-foreground">
                    ยืนยันแล้ว {fund.approvedCount.toLocaleString("th-TH")} รายการ · {formatBaht(fund.approvedAmount)} ·{" "}
                    {share.toFixed(1)}% ของยอดรวม
                  </span>
                  <span className="block text-muted-foreground">
                    รอตรวจสอบ {fund.pendingCount.toLocaleString("th-TH")} รายการ · {formatBaht(fund.pendingAmount)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {pending && (
        <section aria-labelledby="pending-title" className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b p-5">
            <h2 id="pending-title" className="text-lg font-semibold text-primary">
              รอตรวจสอบ (เก่าสุดก่อน)
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/donations?status=PENDING">
                ดูทั้งหมด
                <ArrowRight />
              </Link>
            </Button>
          </div>
          {pending.items.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">ไม่มีรายการค้างตรวจสอบ</p>
          ) : (
            <ul className="divide-y">
              {pending.items.slice(0, 5).map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/admin/donations/${d.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-accent/50"
                  >
                    <span className="font-mono text-xs text-muted-foreground">{donationReference(d.id)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-primary">{d.donorName}</span>
                    <span className="text-sm text-muted-foreground">{d.fund.nameTh}</span>
                    <span className="font-semibold text-primary tabular-nums">{formatBaht(d.amount)}</span>
                    <span className="w-full text-xs text-muted-foreground sm:w-auto">
                      ส่งเมื่อ {dateTime.format(d.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
