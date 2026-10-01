import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Landmark, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { BrandIcon, getSocialLinks } from "@/components/site/social-links";
import { FOUNDATION, FUNDS } from "@/lib/constants";
import { telHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ช่องทางติดต่อมูลนิธิตะเกียงเด็กกำพร้า โทรศัพท์ และโซเชียลมีเดีย",
};

export default function ContactPage() {
  const socials = getSocialLinks();

  return (
    <>
      <PageHeader title="ติดต่อเรา" description="สอบถามข้อมูลการบริจาค โครงการ หรือร่วมเป็นอาสาสมัครกับมูลนิธิ" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:py-14 lg:grid-cols-2">
        <section aria-labelledby="phones" className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 id="phones" className="text-xl font-semibold text-primary">โทรศัพท์</h2>
          <ul className="flex flex-col gap-3">
            {FOUNDATION.contacts.map(({ name, phone }) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-secondary hover:bg-accent"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-secondary">
                    <Phone className="size-5" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-xl font-semibold tracking-wide text-primary">{phone}</span>
                    <span className="text-sm text-muted-foreground">{name} · แตะเพื่อโทร</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {socials.length > 0 && (
            <>
              <h2 className="mt-4 text-xl font-semibold text-primary">โซเชียลมีเดีย</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {socials.map(({ key, href, icon, label }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border p-4 font-medium text-primary transition-colors hover:border-secondary hover:bg-accent"
                    >
                      <BrandIcon icon={icon} className="size-6" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="accounts" className="flex flex-col gap-4 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
          <h2 id="accounts" className="flex items-center gap-2 text-xl font-semibold">
            <Landmark className="size-5 text-secondary" />
            บัญชีบริจาค
          </h2>
          <p className="text-sm text-white/75">
            {FOUNDATION.bankName} · ชื่อบัญชี {FOUNDATION.accountName}
          </p>
          <ul className="flex flex-col divide-y divide-white/10">
            {FUNDS.map((fund) => (
              <li key={fund.slug} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-white/85">{fund.nameTh}</span>
                <span className="font-mono text-lg tracking-wide text-secondary">{fund.accountNumber}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="gold" size="lg" className="mt-auto">
            <Link href="/donate">
              <HeartHandshake />
              บริจาคและแนบสลิป
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
