const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

/** ฿12,345 — accepts Prisma Decimal, number, or numeric string. */
export function formatBaht(value: { toString(): string } | number | null | undefined): string {
  return thb.format(Number(value ?? 0));
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
