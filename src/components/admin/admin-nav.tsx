"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, ReceiptText } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminNav({ pendingCount, canReview }: { pendingCount: number; canReview: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, active: pathname === "/admin" },
    ...(canReview
      ? [
          {
            href: "/admin/donations",
            label: "ตรวจสอบการบริจาค",
            icon: ReceiptText,
            active: pathname.startsWith("/admin/donations"),
            badge: pendingCount,
          },
        ]
      : []),
  ];

  return (
    <nav aria-label="เมนูผู้ดูแล" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon, active, badge }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
          )}
        >
          <Icon className="size-4.5" />
          {label}
          {badge ? (
            <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {badge}
              <span className="sr-only"> รายการรอตรวจสอบ</span>
            </span>
          ) : null}
        </Link>
      ))}
      <Link
        href="/"
        target="_blank"
        className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap text-white/60 hover:text-white lg:mt-4"
      >
        <ExternalLink className="size-4.5" />
        ดูหน้าเว็บไซต์
      </Link>
    </nav>
  );
}
