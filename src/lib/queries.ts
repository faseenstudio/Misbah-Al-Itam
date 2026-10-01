import "server-only";
import { prisma } from "@/lib/prisma";
import type { ActivityCategory } from "@/generated/prisma/client";

// Evaluated per query so scheduled posts appear once their publish time passes.
const publishedWhere = () => ({ status: "PUBLISHED", publishedAt: { lte: new Date() } }) as const;

/** The project highlighted on the home page, with approved donations to its linked fund. */
export async function getFeaturedProject() {
  const project = await prisma.project.findFirst({
    where: { isFeatured: true, isActive: true },
    orderBy: { updatedAt: "desc" },
    include: {
      fund: true,
      activities: {
        where: { ...publishedWhere(), category: "WAQF_UPDATE" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { title: true, slug: true, publishedAt: true },
      },
    },
  });
  if (!project) return null;

  const raised = project.fundId
    ? await prisma.donation.aggregate({
        where: { fundId: project.fundId, status: "APPROVED" },
        _sum: { amount: true },
        _count: true,
      })
    : null;

  return {
    ...project,
    latestUpdate: project.activities[0] ?? null,
    raisedAmount: Number(raised?._sum.amount ?? 0),
    donationCount: raised?._count ?? 0,
  };
}

export async function getPublishedActivities({
  category,
  take,
  skip,
}: { category?: ActivityCategory; take?: number; skip?: number } = {}) {
  const where = { ...publishedWhere(), ...(category ? { category } : {}) };
  const [items, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        category: true,
        publishedAt: true,
        progressPercent: true,
      },
    }),
    prisma.activity.count({ where }),
  ]);
  return { items, total };
}

export type ActivitySummary = Awaited<ReturnType<typeof getPublishedActivities>>["items"][number];

/** Route params arrive percent-encoded, so Thai slugs must be decoded before lookup. */
function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug;
  }
}

export async function getActivityBySlug(slug: string) {
  return prisma.activity.findFirst({
    where: { slug: decodeSlug(slug), ...publishedWhere() },
    include: { project: { select: { title: true, slug: true } } },
  });
}

export async function getActiveFunds() {
  return prisma.fund.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      nameTh: true,
      nameEn: true,
      description: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
    },
  });
}
