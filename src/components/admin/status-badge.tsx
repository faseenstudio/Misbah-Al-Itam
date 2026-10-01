import { CircleCheck, CircleX, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DonationStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<DonationStatus, string> = {
  PENDING: "รอตรวจสอบ",
  APPROVED: "ยืนยันแล้ว",
  REJECTED: "ไม่ผ่าน",
};

/** Status always carries an icon + label, never color alone. */
export function StatusBadge({ status }: { status: DonationStatus }) {
  const Icon = status === "APPROVED" ? CircleCheck : status === "REJECTED" ? CircleX : Clock;
  const variant = status === "APPROVED" ? "success" : status === "REJECTED" ? "destructive" : "warning";
  return (
    <Badge variant={variant}>
      <Icon />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
