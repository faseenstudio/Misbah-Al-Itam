import { NextResponse } from "next/server";

import { DONATION_REVIEWER_ROLES, authorizeAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getSlipSignedUrl, readLocalSlip } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

/** Serves an e-Slip to authorized reviewers only. */
export async function GET(_req: Request, ctx: RouteContext<"/admin/slips/[id]">) {
  const admin = await authorizeAdmin(DONATION_REVIEWER_ROLES);
  if (!admin) return new NextResponse("Not found", { status: 404 });

  const { id } = await ctx.params;
  const donation = await prisma.donation.findUnique({ where: { id }, select: { slipStorageKey: true } });
  if (!donation) return new NextResponse("Not found", { status: 404 });

  const signedUrl = await getSlipSignedUrl(donation.slipStorageKey);
  if (signedUrl) {
    return NextResponse.redirect(signedUrl, { status: 302, headers: PRIVATE_HEADERS });
  }

  try {
    const bytes = await readLocalSlip(donation.slipStorageKey);
    const ext = donation.slipStorageKey.split(".").pop() ?? "";
    return new NextResponse(new Uint8Array(bytes), {
      headers: { ...PRIVATE_HEADERS, "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new NextResponse("Slip file missing", { status: 404, headers: PRIVATE_HEADERS });
  }
}
