import Link from "next/link";
import { FOUNDATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Lamp (ตะเกียง) mark — placeholder until the official logo from the design system is added. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-10", className)}>
      <rect width="40" height="40" rx="10" className="fill-primary" />
      {/* flame */}
      <path
        d="M20 7c2.6 3.4 4.4 5.9 4.4 8.6A4.4 4.4 0 0 1 20 20a4.4 4.4 0 0 1-4.4-4.4C15.6 12.9 17.4 10.4 20 7Z"
        className="fill-secondary"
      />
      <path d="M20 13.2c1 1.3 1.7 2.3 1.7 3.3a1.7 1.7 0 0 1-3.4 0c0-1 .7-2 1.7-3.3Z" fill="#fff" opacity=".85" />
      {/* lamp body */}
      <path
        d="M10 23h20a10 10 0 0 1-10 8 10 10 0 0 1-10-8Z"
        className="fill-secondary"
      />
      <rect x="15" y="31.5" width="10" height="2.5" rx="1.25" className="fill-secondary" />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 rounded-lg", className)}>
      <LogoMark className={inverted ? "[&_rect:first-child]:fill-white/10" : undefined} />
      <span className="flex flex-col leading-tight">
        <span className={cn("font-heading text-base font-semibold", inverted ? "text-white" : "text-primary")}>
          {FOUNDATION.nameTh}
        </span>
        <span className={cn("text-xs", inverted ? "text-white/70" : "text-muted-foreground")}>
          {FOUNDATION.nameEn}
        </span>
      </span>
    </Link>
  );
}
