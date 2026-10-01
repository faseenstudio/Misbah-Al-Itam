import { cn } from "@/lib/utils";

/** Gold line–diamond–line ornament, echoing the dividers on the foundation's posters. */
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center gap-1.5 text-secondary", className)}>
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-current" />
      <svg viewBox="0 0 12 12" className="size-2.5 fill-current">
        <path d="M6 0 12 6 6 12 0 6Z" />
      </svg>
      <span className="h-px w-8 bg-gradient-to-l from-transparent to-current" />
    </span>
  );
}
