import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FundIcon } from "@/components/fund-icon";
import { SectionHeading } from "@/components/home/section-heading";
import { FOUNDATION, FUNDS } from "@/lib/constants";

export function FundGrid() {
  return (
    <section id="funds" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="ช่องทางการบริจาค"
        title="5 กองทุน เลือกได้ตามเจตนา"
        description={`ทุกกองทุนมีบัญชีแยกกันที่${FOUNDATION.bankName} เงินบริจาคจึงถูกใช้ตรงตามวัตถุประสงค์`}
      />
      <ul className="mt-10 flex flex-wrap justify-center gap-4">
        {FUNDS.map((fund) => (
          <li key={fund.slug} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
            <Link
              href={`/donate?fund=${fund.slug}`}
              className="group flex h-full flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-secondary">
                <FundIcon slug={fund.slug} />
              </span>
              <h3 className="text-lg font-semibold text-primary">{fund.nameTh}</h3>
              <p className="text-sm text-muted-foreground">{fund.description}</p>
              <p className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
                <span className="font-mono tracking-wide text-primary">{fund.accountNumber}</span>
                <span className="flex items-center gap-1 font-medium text-primary group-hover:text-secondary-foreground">
                  บริจาค
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
