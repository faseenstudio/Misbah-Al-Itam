"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageUp, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SLIP_MIME_TYPES } from "@/lib/validation/donation";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileDrop({
  id,
  file,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  file: File | null;
  invalid?: boolean;
  describedBy?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pick(files: FileList | null | undefined) {
    const next = files?.[0];
    if (next) onChange(next);
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept={SLIP_MIME_TYPES.join(",")}
      className="sr-only"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => pick(e.target.files)}
    />
  );

  if (file && previewUrl) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center",
          invalid && "border-destructive",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable */}
        <img
          src={previewUrl}
          alt="ตัวอย่างสลิปที่แนบ"
          className="max-h-72 w-full rounded-lg bg-muted object-contain sm:h-32 sm:w-24 sm:object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-medium text-primary">{file.name}</p>
          <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          <div className="mt-2 flex gap-2">
            <label htmlFor={id} className="cursor-pointer">
              {input}
              <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/20 bg-card px-3 text-sm font-semibold text-primary hover:bg-accent has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60">
                <RefreshCw className="size-4" />
                เปลี่ยนไฟล์
              </span>
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-destructive hover:bg-destructive/10">
              <Trash2 />
              ลบ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card px-4 py-8 text-center transition-colors",
        "hover:border-secondary hover:bg-accent/50 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60",
        dragging && "border-secondary bg-accent",
        invalid ? "border-destructive/60" : "border-input",
      )}
    >
      {input}
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
        <ImageUp className="size-6" />
      </span>
      <span className="font-medium text-primary">แตะเพื่อเลือกรูปสลิป</span>
      <span className="text-sm text-muted-foreground">หรือลากไฟล์มาวางที่นี่ · JPG, PNG, WEBP (ภาพใหญ่จะถูกย่ออัตโนมัติ)</span>
    </label>
  );
}
