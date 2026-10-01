import Link from "next/link";
import { Landmark, Phone } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { SocialLinks } from "@/components/site/social-links";
import { FOUNDATION, FUNDS, NAV_LINKS } from "@/lib/constants";
import { telHref } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Logo inverted />
          <p className="max-w-xs text-sm text-white/75">
            ร่วมเป็นแสงสว่างให้เด็กกำพร้าและผู้ยากไร้ ทุกการบริจาคได้รับการตรวจสอบและรายงานอย่างโปร่งใส
          </p>
          <SocialLinks itemClassName="bg-white/10 text-white hover:bg-secondary hover:text-secondary-foreground" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-secondary">เมนู</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/donate" className="text-white/80 hover:text-white">
                บริจาค
              </Link>
            </li>
          </ul>
          <h2 className="mt-3 text-sm font-semibold text-secondary">ติดต่อ</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {FOUNDATION.phones.map((phone) => (
              <li key={phone}>
                <a href={telHref(phone)} className="flex items-center gap-2 text-white/80 hover:text-white">
                  <Phone className="size-4" />
                  {phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Landmark className="size-4" />
            บัญชีมูลนิธิ · {FOUNDATION.bankName}
          </h2>
          <ul className="flex flex-col divide-y divide-white/10 text-sm">
            {FUNDS.map((fund) => (
              <li key={fund.slug} className="flex items-center justify-between gap-3 py-2">
                <span className="text-white/80">{fund.nameTh}</span>
                <span className="font-mono tracking-wide text-white">{fund.accountNumber}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {FOUNDATION.nameTh} · {FOUNDATION.nameEn}
        </p>
      </div>
    </footer>
  );
}
