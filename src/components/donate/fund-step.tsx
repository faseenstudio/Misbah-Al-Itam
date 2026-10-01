import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FundIcon } from "@/components/fund-icon";
import { cn } from "@/lib/utils";
import type { DonateFund } from "./types";

export function FundStep({
  funds,
  selectedId,
  error,
  onSelect,
  onNext,
}: {
  funds: DonateFund[];
  selectedId: string | null;
  error?: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3" aria-describedby={error ? "fund-error" : undefined}>
        <legend className="sr-only">เลือกกองทุนที่ต้องการบริจาค</legend>
        {funds.map((fund) => {
          const checked = fund.id === selectedId;
          return (
            <label
              key={fund.id}
              className={cn(
                "group flex cursor-pointer items-center gap-4 rounded-xl border-2 bg-card p-4 transition-colors",
                "hover:border-secondary/70 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60",
                checked ? "border-primary bg-accent/40" : "border-border",
              )}
            >
              <input
                type="radio"
                name="fund"
                value={fund.id}
                checked={checked}
                onChange={() => onSelect(fund.id)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                  checked ? "bg-primary text-secondary" : "bg-accent text-primary",
                )}
              >
                <FundIcon slug={fund.slug} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-semibold text-primary">{fund.nameTh}</span>
                {fund.description && <span className="text-sm text-muted-foreground">{fund.description}</span>}
                <span className="font-mono text-sm tracking-wide text-gold-deep">{fund.accountNumber}</span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  checked ? "border-primary" : "border-input",
                )}
              >
                <span className={cn("size-3 rounded-full transition-colors", checked ? "bg-primary" : "bg-transparent")} />
              </span>
            </label>
          );
        })}
      </fieldset>

      {error && (
        <p id="fund-error" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="button" size="lg" onClick={onNext} disabled={!selectedId} className="w-full sm:ml-auto sm:w-auto">
        ถัดไป: ดูเลขบัญชี
        <ArrowRight />
      </Button>
    </div>
  );
}
