import { siFacebook, siLine, siTiktok, siYoutube, type SimpleIcon } from "simple-icons";
import { FOUNDATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SocialKey = keyof typeof FOUNDATION.social;

const ICONS: Record<SocialKey, SimpleIcon> = {
  facebook: siFacebook,
  line: siLine,
  youtube: siYoutube,
  tiktok: siTiktok,
};

export function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" aria-hidden="true" className={cn("size-5 fill-current", className)}>
      <path d={icon.path} />
    </svg>
  );
}

/** Configured social links only — empty URLs in FOUNDATION.social are skipped. */
export function getSocialLinks() {
  return (Object.keys(ICONS) as SocialKey[])
    .filter((key) => FOUNDATION.social[key])
    .map((key) => ({ key, href: FOUNDATION.social[key] as string, icon: ICONS[key], label: ICONS[key].title }));
}

export function SocialLinks({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const links = getSocialLinks();
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {links.map(({ key, href, icon, label }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn("flex size-10 items-center justify-center rounded-full transition-colors", itemClassName)}
          >
            <BrandIcon icon={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
