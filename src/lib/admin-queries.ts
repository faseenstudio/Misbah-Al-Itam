import "server-only";
import { prisma } from "@/lib/prisma";
import type { DonationStatus, Prisma } from "@/generated/prisma/client";

// Thailand has no DST, so the offset is fixed.
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Start of the current calendar month in Bangkok time, as a UTC instant. */
export function startOfBangkokMonth(now = new Date()) {
  const local = new Date(now.getTime() + BANGKOK_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - BANGKOK_OFFSET_MS);
}

export async function getDashboardStats() {
  const monthStart = startOfBangkokMonth();
  const [funds, byFundStatus, thisMonth] = await Promise.all([
    prisma.fund.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, nameTh: true, accountNumber: true, isActive: true },
    }),
    prisma.donation.groupBy({
      by: ["fundId", "status"],
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donation.aggregate({
      where: { status: "APPROVED", transferredAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const cell = (fundId: string, status: DonationStatus) =>
    byFundStatus.find((r) => r.fundId === fundId && r.status === status);

  const perFund = funds.map((fund) => {
    const approved = cell(fund.id, "APPROVED");
    const pending = cell(fund.id, "PENDING");
    return {
      ...fund,
      approvedAmount: Number(approved?._sum.amount ?? 0),
      approvedCount: approved?._count._all ?? 0,
      pendingAmount: Number(pending?._sum.amount ?? 0),
      pendingCount: pending?._count._all ?? 0,
    };
  });

  const sum = (status: DonationStatus) =>
    byFundStatus.filter((r) => r.status === status).reduce((acc, r) => acc + Number(r._sum.amount ?? 0), 0);
  const count = (status: DonationStatus) =>
    byFundStatus.filter((r) => r.status === status).reduce((acc, r) => acc + r._count._all, 0);

  return {
    perFund,
    approvedTotal: sum("APPROVED"),
    approvedCount: count("APPROVED"),
    pendingTotal: sum("PENDING"),
    pendingCount: count("PENDING"),
    rejectedCount: count("REJECTED"),
    monthTotal: Number(thisMonth._sum.amount ?? 0),
    monthCount: thisMonth._count._all,
    monthStart,
  };
}

export const DONATION_PAGE_SIZE = 20;

export async function listDonations({
  status,
  fundId,
  q,
  page,
}: {
  status?: DonationStatus;
  fundId?: string;
  q?: string;
  page: number;
}) {
  const search = q?.trim();
  // "MSB-AB12CD34" references are the last 8 chars of the id, upper-cased.
  const refMatch = search?.match(/^(?:MSB-)?([a-z0-9]{8})$/i);

  const where: Prisma.DonationWhereInput = {
    ...(status ? { status } : {}),
    ...(fundId ? { fundId } : {}),
    ...(search
      ? {
          OR: [
            { donorName: { contains: search, mode: "insensitive" } },
            { donorPhone: { contains: search.replace(/[\s-]/g, "") } },
            ...(refMatch ? [{ id: { endsWith: refMatch[1].toLowerCase() } }] : []),
          ],
        }
      : {}),
  };

  const [items, total, statusCounts] = await Promise.all([
    prisma.donation.findMany({
      where,
      // Oldest pending first so nothing waits forever; otherwise newest first.
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      take: DONATION_PAGE_SIZE,
      skip: (page - 1) * DONATION_PAGE_SIZE,
      select: {
        id: true,
        donorName: true,
        isAnonymous: true,
        amount: true,
        transferredAt: true,
        createdAt: true,
        status: true,
        fund: { select: { nameTh: true, slug: true } },
      },
    }),
    prisma.donation.count({ where }),
    prisma.donation.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return {
    items,
    total,
    statusCounts: Object.fromEntries(statusCounts.map((r) => [r.status, r._count._all])) as Partial<
      Record<DonationStatus, number>
    >,
  };
}

export async function getDonationForReview(id: string) {
  return prisma.donation.findUnique({
    where: { id },
    include: {
      fund: { select: { nameTh: true, slug: true, accountNumber: true, bankName: true } },
      reviewedBy: { select: { name: true } },
    },
  });
}

export async function getPendingCount() {
  return prisma.donation.count({ where: { status: "PENDING" } });
}
