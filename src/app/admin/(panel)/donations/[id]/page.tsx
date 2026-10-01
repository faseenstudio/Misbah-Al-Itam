import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/admin/review-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { FundIcon } from "@/components/fund-icon";
import { getDonationForReview } from "@/lib/admin-queries";
import { DONATION_REVIEWER_ROLES, requireAdmin } from "@/lib/dal";
import { donationReference, formatBaht } from "@/lib/format";
import { reopenDonation } from "../actions";

export const metadata = { title: "ตรวจสอบสลิป" };

const dateTime = new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function DonationReviewPage({ params }: PageProps<"/admin/donations/[id]">) {
  await requireAdmin(DONATION_REVIEWER_ROLES);
  const { id } = await params;
  const d = await getDonationForReview(id);
  if (!d) notFound();

  const slipSrc = `/admin/slips/${d.id}`;
  const rows: Array<[string, React.ReactNode]> = [
    ["เลขอ้างอิง", <span key="ref" className="font-mono">{donationReference(d.id)}</span>],
    [
      "ผู้บริจาค",
      <span key="name">
        {d.donorName}
        {d.isAnonymous && <Badge variant="outline" className="ml-2">ไม่ประสงค์ออกนาม</Badge>}
      </span>,
    ],
    ["เบอร์โทร", d.donorPhone ? <a key="tel" href={`tel:${d.donorPhone}`} className="underline">{d.donorPhone}</a> : "—"],
    ["วันเวลาที่โอน (ตามที่แจ้ง)", dateTime.format(d.transferredAt)],
    ["ส่งข้อมูลเมื่อ", dateTime.format(d.createdAt)],
    ["ข้อความ", d.message || "—"],
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/admin/donations" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        กลับไปรายการ
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-primary">ตรวจสอบสลิป</h1>
        <StatusBadge status={d.status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Slip */}
        <section aria-label="สลิปการโอนเงิน" className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-primary">สลิปการโอนเงิน</h2>
            <Button asChild variant="ghost" size="sm">
              <a href={slipSrc} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                เปิดขนาดเต็ม
              </a>
            </Button>
          </div>
          <div className="flex min-h-80 items-center justify-center rounded-lg bg-muted p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated image; must not go through the public image optimizer */}
            <img src={slipSrc} alt={`สลิปของ ${d.donorName}`} className="max-h-[75vh] w-auto rounded object-contain" />
          </div>
        </section>

        {/* Details + decision */}
        <div className="flex flex-col gap-6">
          <section aria-label="ยอดที่แจ้ง" className="rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
            <p className="text-sm text-white/70">ยอดที่แจ้งโอน</p>
            <p className="font-heading text-3xl font-bold text-secondary tabular-nums">{formatBaht(d.amount)}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-secondary">
                <FundIcon slug={d.fund.slug} className="size-5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{d.fund.nameTh}</span>
                <span className="text-sm text-white/70">{d.fund.bankName}</span>
                <span className="font-mono text-sm whitespace-nowrap text-white/70">{d.fund.accountNumber}</span>
              </div>
            </div>
          </section>

          <section aria-label="รายละเอียด" className="rounded-xl border bg-card p-5 shadow-sm">
            <dl className="flex flex-col divide-y text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-3 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-words text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="ผลการตรวจสอบ" className="rounded-xl border bg-card p-5 shadow-sm">
            {d.status === "PENDING" ? (
              <ReviewForm donationId={d.id} />
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <p>
                  <StatusBadge status={d.status} /> โดย {d.reviewedBy?.name ?? "—"}
                  {d.reviewedAt && <> · {dateTime.format(d.reviewedAt)}</>}
                </p>
                {d.reviewNote && <p className="rounded-lg bg-muted p-3">{d.reviewNote}</p>}
                <form action={reopenDonation}>
                  <input type="hidden" name="id" value={d.id} />
                  <Button type="submit" variant="outline" size="sm">
                    <RotateCcw />
                    ย้อนกลับเป็นรอตรวจสอบ
                  </Button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
