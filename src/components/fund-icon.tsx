import { Building2, GraduationCap, HandCoins, HandHeart, House, type LucideIcon } from "lucide-react";
import type { FundSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FUND_ICONS: Record<FundSlug, LucideIcon> = {
  admin: Building2,
  orphans: HandHeart,
  waqf: House,
  zakat: HandCoins,
  education: GraduationCap,
};

export function FundIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = FUND_ICONS[slug as FundSlug] ?? HandHeart;
  return <Icon aria-hidden="true" className={cn("size-6", className)} />;
}
