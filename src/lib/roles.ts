import type { Role } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "ผู้ดูแลสูงสุด",
  ADMIN: "ผู้ดูแล",
  EDITOR: "ผู้จัดการเนื้อหา",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "ทำได้ทุกอย่าง รวมถึงเพิ่ม แก้ไข และลบผู้ดูแลระบบ",
  ADMIN: "ตรวจสอบสลิป อนุมัติ/ปฏิเสธการบริจาค และจัดการเนื้อหา",
  EDITOR: "จัดการกิจกรรม ข่าวสาร และหน้าโครงการเท่านั้น ไม่เห็นข้อมูลผู้บริจาค",
};

export const ROLES = Object.keys(ROLE_LABELS) as Role[];
