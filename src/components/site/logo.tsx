import Image from "next/image";
import Link from "next/link";
import { FOUNDATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import logoBadge from "../../../public/brand/logo-badge.png";

/** Official round badge logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={logoBadge}
      alt=""
      width={48}
      height={48}
      priority
      className={cn("size-11 shrink-0 rounded-full bg-white sm:size-12", className)}
    />
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 rounded-lg", className)}>
      <LogoMark className={inverted ? "ring-2 ring-secondary/60" : undefined} />
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
