import Link from "next/link";
import { HeartHandshake, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FOUNDATION } from "@/lib/constants";
import { telHref } from "@/lib/format";

export function ContactCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="relative isolate overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14">
        <div aria-hidden="true" className="absolute -right-20 -bottom-24 -z-10 size-80 rounded-full bg-secondary/30 blur-3xl" />
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold sm:text-3xl">มีคำถามเกี่ยวกับการบริจาค?</h2>
            <p className="text-white/80">ติดต่อเจ้าหน้าที่มูลนิธิได้โดยตรง ยินดีให้ข้อมูลทุกวัน</p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {FOUNDATION.contacts.map(({ name, phone }) => (
                <a key={phone} href={telHref(phone)} className="flex items-center gap-2 text-lg font-semibold text-secondary hover:underline">
                  <Phone className="size-5" />
                  {phone}
                  <span className="text-sm font-normal text-white/70">{name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href="/donate">
                <HeartHandshake />
                บริจาคเลย
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/contact">ช่องทางติดต่อทั้งหมด</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
