import { OrnamentDivider } from "@/components/ornament-divider";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <p className="flex flex-col gap-1.5 text-sm font-semibold text-gold-deep" style={{ alignItems: "inherit" }}>
          {eyebrow}
          <OrnamentDivider />
        </p>
      )}
      <h2 className="text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
