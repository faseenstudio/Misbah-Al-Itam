export const FOUNDATION = {
  nameTh: "มูลนิธิตะเกียงเด็กกำพร้า",
  nameEn: "Misbah Al-Itam Foundation",
  bankName: "ธนาคารอิสลามแห่งประเทศไทย",
  // TODO: confirm the exact account holder name printed on the bank book
  accountName: "มูลนิธิตะเกียงเด็กกำพร้า",
  tagline: "พื้นที่แห่งการแบ่งปัน",
  phones: ["093-582-6662", "089-794-0963"],
  contacts: [
    { name: "อ.ฟาฮัน", phone: "093-582-6662" },
    { name: "อ.ซัยดี้", phone: "089-794-0963" },
  ],
  // Location of the Baan Takiang Waqf project
  baanTakiangLocation: "ต.ละงู อ.ละงู จ.สตูล",
  // TODO: fill in the foundation's real social media URLs — empty entries are hidden
  social: {
    facebook: "",
    line: "",
    youtube: "",
    tiktok: "",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/activities", label: "กิจกรรมและข่าวสาร" },
  { href: "/#waqf", label: "โครงการบ้านตะเกียง" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

export type FundSlug = "admin" | "orphans" | "waqf" | "zakat" | "education";

export const FUNDS: ReadonlyArray<{
  slug: FundSlug;
  nameTh: string;
  nameEn: string;
  description: string;
  accountNumber: string;
  sortOrder: number;
}> = [
  {
    slug: "admin",
    nameTh: "เพื่อการบริหาร",
    nameEn: "Administration",
    description: "สนับสนุนการดำเนินงานและการบริหารจัดการของมูลนิธิ",
    accountNumber: "061-1-16459-0",
    sortOrder: 1,
  },
  {
    slug: "orphans",
    nameTh: "สานฝันเด็กกำพร้าและผู้ยากไร้",
    nameEn: "Orphans & the Needy",
    description: "ดูแลความเป็นอยู่ของเด็กกำพร้าและผู้ยากไร้",
    accountNumber: "061-1-16461-2",
    sortOrder: 2,
  },
  {
    slug: "waqf",
    nameTh: "บ้านตะเกียง",
    nameEn: "Baan Takiang (Waqf)",
    description: "ร่วมวะกัฟสร้างบ้านตะเกียง ผลบุญต่อเนื่องไม่สิ้นสุด",
    accountNumber: "061-1-16458-2",
    sortOrder: 3,
  },
  {
    slug: "zakat",
    nameTh: "กองทุนซะกาต",
    nameEn: "Zakat Fund",
    description: "จ่ายซะกาตผ่านมูลนิธิ ส่งถึงผู้มีสิทธิ์รับอย่างถูกต้อง",
    accountNumber: "061-1-16462-0",
    sortOrder: 4,
  },
  {
    slug: "education",
    nameTh: "ให้น้องได้เรียน",
    nameEn: "Education",
    description: "ทุนการศึกษาและอุปกรณ์การเรียนสำหรับน้อง ๆ",
    accountNumber: "061-1-16460-4",
    sortOrder: 5,
  },
];
