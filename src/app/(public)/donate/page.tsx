import type { Metadata } from "next";
import { BadgeCheck, FileSearch, Phone, ReceiptText } from "lucide-react";

import { DonationWizard } from "@/components/donate/donation-wizard";
import { PageHeader } from "@/components/site/page-header";
import { FOUNDATION } from "@/lib/constants";
import { telHref } from "@/lib/format";
import { getActiveFunds } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บริจาค",
  description: "บริจาคให้มูลนิธิตะเกียงเด็กกำพร้า เลือกกองทุน โอนเงินเข้าบัญชีมูลนิธิ และแนบสลิปเพื่อยืนยันการบริจาค",
};

const AFTER_STEPS = [
  { icon: ReceiptText, title: "ท่านแจ้งโอนและแนบสลิป", text: "ข้อมูลถูกส่งถึงมูลนิธิทันที" },
  { icon: FileSearch, title: "เจ้าหน้าที่ตรวจสอบ", text: "เทียบสลิปกับรายการเดินบัญชีของมูลนิธิ" },
  { icon: BadgeCheck, title: "ยืนยันยอดบริจาค", text: "ยอดถูกนับรวมในรายงานของกองทุนนั้น" },
];

export default async function DonatePage({ searchParams }: PageProps<"/donate">) {
  const [{ fund: fundParam }, funds] = await Promise.all([searchParams, getActiveFunds()]);
  const initialFund = typeof fundParam === "string" ? funds.find((f) => f.slug === fundParam) : undefined;

  return (
    <>
      <PageHeader title="บริจาค" description="เลือกกองทุน โอนเงินเข้าบัญชีมูลนิธิ แล้วแนบสลิปเพื่อยืนยันการบริจาค ใช้เวลาไม่ถึง 2 นาที" />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card/60 p-4 shadow-sm sm:p-8">
          <DonationWizard funds={funds} initialFundId={initialFund?.id ?? null} />
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="after-title" className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 id="after-title" className="mb-4 font-semibold text-primary">
              หลังจากแจ้งโอน
            </h2>
            <ol className="flex flex-col gap-4">
              {AFTER_STEPS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-primary">{title}</span>
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="help-title" className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
            <h2 id="help-title" className="mb-1 font-semibold">
              ต้องการความช่วยเหลือ?
            </h2>
            <p className="mb-4 text-sm text-white/75">สอบถามเรื่องการบริจาคได้ที่</p>
            <ul className="flex flex-col gap-2">
              {FOUNDATION.contacts.map(({ name, phone }) => (
                <li key={phone}>
                  <a href={telHref(phone)} className="flex items-center gap-2 font-semibold text-secondary hover:underline">
                    <Phone className="size-4" />
                    {phone}
                    <span className="text-sm font-normal text-white/70">{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
