"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "คัดลอก",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the number is still visible to copy manually.
    }
  }

  return (
    <Button type="button" variant="gold" size="sm" onClick={copy} className={cn("min-w-28", className)}>
      {copied ? <Check /> : <Copy />}
      {copied ? "คัดลอกแล้ว" : label}
      <span className="sr-only" aria-live="polite">
        {copied ? "คัดลอกเลขบัญชีแล้ว" : ""}
      </span>
    </Button>
  );
}
