import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { step: 1, label: "เลือกกองทุน" },
  { step: 2, label: "โอนเงิน" },
  { step: 3, label: "แจ้งการโอน" },
] as const;

export function StepIndicator({
  current,
  canGoTo,
  onGoTo,
}: {
  current: 1 | 2 | 3 | "done";
  canGoTo: (step: 1 | 2 | 3) => boolean;
  onGoTo: (step: 1 | 2 | 3) => void;
}) {
  const currentIndex = current === "done" ? STEPS.length + 1 : current;

  return (
    <nav aria-label="ขั้นตอนการบริจาค">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map(({ step, label }) => {
          const isCurrent = step === currentIndex;
          const isComplete = step < currentIndex;
          const clickable = !isCurrent && current !== "done" && canGoTo(step);
          const content = (
            <>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isComplete && "border-secondary bg-secondary text-secondary-foreground",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  !isComplete && !isCurrent && "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-4" strokeWidth={3} /> : step}
              </span>
              <span
                className={cn(
                  "text-center text-xs font-medium sm:text-sm",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </>
          );

          return (
            <li key={step} aria-current={isCurrent ? "step" : undefined} className="relative">
              {/* connector line */}
              {step > 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[22px] right-1/2 h-0.5 w-[calc(100%+0.5rem)]",
                    step <= currentIndex ? "bg-secondary" : "bg-border",
                  )}
                />
              )}
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onGoTo(step)}
                  className="relative z-10 flex w-full flex-col items-center gap-1.5 rounded-lg py-1 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  {content}
                  <span className="sr-only">(ย้อนกลับไปขั้นตอนนี้)</span>
                </button>
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-1.5 py-1">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
