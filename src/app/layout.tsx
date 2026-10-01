import type { Metadata } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "มูลนิธิตะเกียงเด็กกำพร้า | Misbah Al-Itam Foundation",
    template: "%s | มูลนิธิตะเกียงเด็กกำพร้า",
  },
  description:
    "มูลนิธิตะเกียงเด็กกำพร้า ร่วมบริจาคเพื่อเด็กกำพร้าและผู้ยากไร้ โครงการวะกัฟบ้านตะเกียง กองทุนซะกาต และทุนการศึกษา",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${prompt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
