"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Menu, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { FOUNDATION, NAV_LINKS } from "@/lib/constants";
import { telHref } from "@/lib/format";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18">
        <Logo />

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary",
                "aria-[current=page]:text-primary aria-[current=page]:font-semibold",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" className="hidden sm:inline-flex">
            <Link href="/donate">
              <HeartHandshake />
              บริจาคเลย
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="เปิดเมนู">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="border-b">
                <SheetTitle>เมนู</SheetTitle>
                <SheetDescription className="sr-only">เมนูนำทางของเว็บไซต์</SheetDescription>
              </SheetHeader>
              <nav aria-label="เมนูมือถือ" className="flex flex-col gap-1 px-3">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-primary"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 border-t p-4">
                <SheetClose asChild>
                  <Button asChild variant="gold" size="lg">
                    <Link href="/donate">
                      <HeartHandshake />
                      บริจาคเลย
                    </Link>
                  </Button>
                </SheetClose>
                {FOUNDATION.phones.map((phone) => (
                  <a key={phone} href={telHref(phone)} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4" />
                    {phone}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
