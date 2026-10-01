import Link from "next/link";
import { CircleCheck, CircleX, Search } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, StatusBadge } from "@/components/admin/status-badge";
import { DONATION_PAGE_SIZE, listDonations } from "@/lib/admin-queries";
import { DONATION_REVIEWER_ROLES, requireAdmin } from "@/lib/dal";
import { donationReference, formatBaht } from "@/lib/format";
import { getActiveFunds } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { DonationStatus } from "@/generated/prisma/client";

export const metadata = { title: "ตรวจสอบการบริจาค" };

const STATUSES: DonationStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function DonationsPage({ searchParams }: PageProps<"/admin/donations">) {
  await requireAdmin(DONATION_REVIEWER_ROLES);
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const rawStatus = str(sp.status);
  const status = rawStatus === "ALL" ? undefined : STATUSES.includes(rawStatus as DonationStatus) ? (rawStatus as DonationStatus) : "PENDING";
  const fundId = str(sp.fund) || undefined;
  const q = str(sp.q) || undefined;
  const page = Math.max(1, Number.parseInt(str(sp.page) ?? "1", 10) || 1);
  const done = str(sp.done);

  const [{ items, total, statusCounts }, funds] = await Promise.all([
    listDonations({ status, fundId, q, page }),
    getActiveFunds(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / DONATION_PAGE_SIZE));

  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status: status ?? "ALL", fund: fundId, q, page: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return `/admin/donations?${params}`;
  };

  const tabs = [
    ...STATUSES.map((s) => ({ value: s as string, label: STATUS_LABELS[s], count: statusCounts[s] ?? 0 })),
    { value: "ALL", label: "ทั้งหมด", count: Object.values(statusCounts).reduce((a, b) => a + (b ?? 0), 0) },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">ตรวจสอบการบริจาค</h1>
        <p className="text-muted-foreground">ตรวจสลิปกับรายการเดินบัญชีของมูลนิธิ แล้วกดยืนยันหรือไม่ผ่าน</p>
      </header>

      {done && (
        <Alert variant={done === "approved" ? "success" : "default"}>
          {done === "approved" ? <CircleCheck /> : <CircleX />}
          <AlertDescription>
            {done === "approved" ? "ยืนยันการบริจาคเรียบร้อยแล้ว" : "บันทึกว่าไม่ผ่านการตรวจสอบแล้ว"}
          </AlertDescription>
        </Alert>
      )}

      <nav aria-label="สถานะ" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          {tabs.map((tab) => {
            const active = (status ?? "ALL") === tab.value;
            return (
              <li key={tab.value}>
                <Link
                  href={href({ status: tab.value })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-accent",
                  )}
                >
                  {tab.label}
                  <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/15" : "bg-muted")}>{tab.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="status" value={status ?? "ALL"} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="ค้นหาชื่อ เบอร์โทร หรือเลขอ้างอิง MSB-…" className="h-11 pl-9" aria-label="ค้นหา" />
        </div>
        <select
          name="fund"
          defaultValue={fundId ?? ""}
          aria-label="กองทุน"
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <option value="">ทุกกองทุน</option>
          {funds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nameTh}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="h-11">
          กรอง
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">ไม่พบรายการ</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {/* Desktop table */}
          <table className="hidden w-full text-sm md:table">
            <caption className="sr-only">รายการบริจาค</caption>
            <thead className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">เลขอ้างอิง</th>
                <th scope="col" className="px-4 py-3 font-medium">ผู้บริจาค</th>
                <th scope="col" className="px-4 py-3 font-medium">กองทุน</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">จำนวนเงิน</th>
                <th scope="col" className="px-4 py-3 font-medium">เวลาโอน</th>
                <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">การดำเนินการ</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{donationReference(d.id)}</td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {d.donorName}
                    {d.isAnonymous && <Badge variant="outline" className="ml-2">ไม่ออกนาม</Badge>}
                  </td>
                  <td className="px-4 py-3">{d.fund.nameTh}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary tabular-nums">{formatBaht(d.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dateTime.format(d.transferredAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant={d.status === "PENDING" ? "default" : "outline"}>
                      <Link href={`/admin/donations/${d.id}`}>{d.status === "PENDING" ? "ตรวจสอบ" : "ดู"}</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="divide-y md:hidden">
            {items.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/donations/${d.id}`} className="flex flex-col gap-1.5 p-4 hover:bg-accent/40">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-primary">{d.donorName}</span>
                    <span className="font-semibold text-primary tabular-nums">{formatBaht(d.amount)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{d.fund.nameTh} · {dateTime.format(d.transferredAt)}</span>
                    <StatusBadge status={d.status} />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{donationReference(d.id)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="หน้า" className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline"><Link href={href({ page: String(page - 1) })}>ก่อนหน้า</Link></Button>
          ) : (
            <Button variant="outline" disabled>ก่อนหน้า</Button>
          )}
          <span className="text-sm text-muted-foreground">หน้า {page} / {totalPages} · {total} รายการ</span>
          {page < totalPages ? (
            <Button asChild variant="outline"><Link href={href({ page: String(page + 1) })}>ถัดไป</Link></Button>
          ) : (
            <Button variant="outline" disabled>ถัดไป</Button>
          )}
        </nav>
      )}
    </div>
  );
}
