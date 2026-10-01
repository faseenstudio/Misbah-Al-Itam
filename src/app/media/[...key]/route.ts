import { NextResponse } from "next/server";
import { readLocalMedia } from "@/lib/storage";

// Serves locally stored media in development / SLIP_STORAGE=local deployments.
// With Supabase configured, media URLs point straight at the public bucket instead.
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key } = await ctx.params;
  const joined = key.join("/");
  const type = CONTENT_TYPES[joined.split(".").pop() ?? ""];
  if (!type) return new NextResponse("Not found", { status: 404 });
  try {
    const bytes = await readLocalMedia(joined);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
