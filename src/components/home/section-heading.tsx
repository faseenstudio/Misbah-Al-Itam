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
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground/80">
          <span aria-hidden="true" className="h-0.5 w-6 rounded bg-secondary" />
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
