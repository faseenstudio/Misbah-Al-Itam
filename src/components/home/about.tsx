import { BookOpen, HandHeart, House } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";

// TODO: replace with the official foundation introduction from the SRS document
const PILLARS = [
  {
    icon: HandHeart,
    title: "ดูแลเด็กกำพร้าและผู้ยากไร้",
    text: "สนับสนุนปัจจัยยังชีพ อาหาร และการดูแลอย่างอบอุ่น ให้น้อง ๆ เติบโตอย่างมีศักดิ์ศรี",
  },
  {
    icon: BookOpen,
    title: "ให้น้องได้เรียน",
    text: "ทุนการศึกษาและอุปกรณ์การเรียน ควบคู่การปลูกฝังคุณธรรมตามหลักศาสนาอิสลาม",
  },
  {
    icon: House,
    title: "วะกัฟบ้านตะเกียง",
    text: "สร้างบ้านพักและพื้นที่เรียนรู้ถาวร เป็นทรัพย์สินวะกัฟเพื่อประโยชน์ของเด็กกำพร้ารุ่นต่อรุ่น",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="เกี่ยวกับมูลนิธิ"
        title="แสงสว่างเล็ก ๆ ที่ส่งต่อถึงน้อง ๆ"
        description="มูลนิธิตะเกียงเด็กกำพร้า (Misbah Al-Itam) ทำงานเพื่อดูแลเด็กกำพร้าและครอบครัวผู้ยากไร้ ด้วยความเชื่อว่าเด็กทุกคนควรได้รับโอกาสในชีวิต การศึกษา และความรัก"
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon className="size-6" />
            </span>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
