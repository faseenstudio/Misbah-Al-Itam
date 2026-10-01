"use client";

import { useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";

import { uploadMediaAction } from "@/app/admin/(panel)/media-actions";
import { cn } from "@/lib/utils";

const MAX_DIMENSION = 2000;

/**
 * Downscale and re-encode in the browser before upload: phone photos are often 5–10 MB,
 * well over the Server Action body limit. Also converts HEIC → JPEG where the browser can decode it.
 */
async function prepareImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // flatten transparency for JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    // Keep the original when it is already small and re-encoding wouldn't help.
    return blob && (blob.size < file.size || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) ? blob : file;
  } catch {
    return file; // undecodable here — let the server decide
  }
}

type Props = {
  /** Current image URLs. */
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  folder?: "activities" | "projects";
  label: string;
  id: string;
  invalid?: boolean;
};

export function ImageUpload({ value, onChange, multiple = false, folder = "activities", label, id, invalid }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = multiple ? Array.from(files) : [files[0]];
    setUploading(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      const body = new FormData();
      body.set("file", new File([await prepareImage(file)], file.name.replace(/\.\w+$/, ".jpg")));
      body.set("folder", folder);
      try {
        const result = await uploadMediaAction(body);
        if (result.ok) uploaded.push(result.url);
        else setError(`${file.name}: ${result.error}`);
      } catch {
        setError(`${file.name}: อัปโหลดไม่สำเร็จ`);
      }
      setUploading((n) => n - 1);
    }
    onChange(multiple ? [...value, ...uploaded] : uploaded.length ? [uploaded[0]] : value);
    if (inputRef.current) inputRef.current.value = "";
  }

  const canAdd = multiple || value.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {(value.length > 0 || uploading > 0) && (
        <ul className={cn("grid gap-3", multiple ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:max-w-sm")}>
          {value.map((url, i) => (
            <li key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of freshly uploaded media */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                aria-label={`ลบรูปที่ ${i + 1}`}
                className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <span className="sr-only">กำลังอัปโหลด</span>
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <label
          htmlFor={id}
          className={cn(
            "flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-card px-4 py-3 text-sm font-medium text-primary hover:border-secondary hover:bg-accent/50 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60",
            invalid && "border-destructive",
            uploading > 0 && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-5" />
          {label}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="sr-only"
            disabled={uploading > 0}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
