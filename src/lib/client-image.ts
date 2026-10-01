/**
 * Browser-side image downscaling. Hosting platforms cap request bodies (Vercel: 4.5 MB),
 * and phone photos are often 5–10 MB, so large images are resized and re-encoded as JPEG
 * before upload. Also converts HEIC → JPEG where the browser can decode it.
 */
const PASSTHROUGH_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function downscaleImage(
  file: File,
  { maxDimension, quality, keepIfSmallerThan = 0 }: { maxDimension: number; quality: number; keepIfSmallerThan?: number },
): Promise<File> {
  // Small, already-supported files are sent untouched (keeps e-Slips byte-for-byte).
  if (file.size <= keepIfSmallerThan && PASSTHROUGH_TYPES.includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // flatten transparency for JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || (blob.size >= file.size && PASSTHROUGH_TYPES.includes(file.type))) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // undecodable here — let validation / the server decide
  }
}
