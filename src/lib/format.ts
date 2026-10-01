const thb = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const thbSatang = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

/** ฿12,345 or ฿1,500.50 — never rounds away satang. Accepts Prisma Decimal, number, or numeric string. */
export function formatBaht(value: { toString(): string } | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? thb.format(n) : thbSatang.format(n);
}

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** 1 ตุลาคม 2569 (Buddhist calendar). */
export function formatThaiDate(date: Date | null | undefined): string {
  return date ? thaiDate.format(date) : "";
}

/** "0935826662" — for tel: links. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Short, human-friendly donation reference shown to the donor and searchable by admins. */
export function donationReference(id: string): string {
  return `MSB-${id.slice(-8).toUpperCase()}`;
}
