import Link from "next/link";
import { ArrowRight, HeartHandshake, Landmark, ReceiptText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FundIcon } from "@/components/fund-icon";
import { FOUNDATION, FUNDS } from "@/lib/constants";

const TRUST_POINTS = [
  { icon: Landmark, text: "โอนตรงเข้าบัญชีมูลนิธิ ธนาคารอิสลามแห่งประเทศไทย" },
  { icon: ShieldCheck, text: "ตรวจสอบสลิปทุกรายการโดยเจ้าหน้าที่" },
  { icon: ReceiptText, text: "รายงานความคืบหน้าอย่างโปร่งใส" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      {/* soft lamp glow */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full bg-secondary/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:py-24">
        <div className="flex flex-col gap-6">
          <p className="w-fit rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-sm text-secondary">
            {FOUNDATION.nameTh} · {FOUNDATION.tagline}
          </p>
          <h1 className="text-3xl font-bold sm:text-5xl sm:leading-[1.25]">
            ร่วมจุด<span className="text-secondary">ตะเกียง</span>
            <br />
            ส่องทางให้<span className="whitespace-nowrap">เด็กกำพร้า</span><span className="whitespace-nowrap">และผู้ยากไร้</span>
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            ทุกการให้ของท่าน คือที่พักพิง การศึกษา และอนาคตของน้อง ๆ ร่วมสร้าง “บ้านตะเกียง”
            วะกัฟที่ผลบุญไหลต่อเนื่องไม่สิ้นสุด
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href="/donate">
                <HeartHandshake />
                บริจาคเลย
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="#waqf">
                โครงการบ้านตะเกียง
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="flex flex-col gap-2 pt-2 text-sm text-white/80">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-secondary" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick fund picker */}
        <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-6">
          <h2 className="text-lg font-semibold text-primary">เลือกกองทุนที่ต้องการบริจาค</h2>
          <p className="mb-4 text-sm text-muted-foreground">5 กองทุน บัญชีแยกชัดเจน ตรวจสอบได้</p>
          <ul className="flex flex-col gap-2">
            {FUNDS.map((fund) => (
              <li key={fund.slug}>
                <Link
                  href={`/donate?fund=${fund.slug}`}
                  className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-secondary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary group-hover:bg-secondary group-hover:text-secondary-foreground">
                    <FundIcon slug={fund.slug} className="size-5" />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-medium text-primary">{fund.nameTh}</span>
                    <span className="font-mono text-xs text-muted-foreground">{fund.accountNumber}</span>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
