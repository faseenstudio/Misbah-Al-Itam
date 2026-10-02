import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, HeartHandshake, ImageIcon, MapPin, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BankAccountCard } from "@/components/donate/transfer-step";
import { SectionHeading } from "@/components/home/section-heading";
import { ProjectProgressCard } from "@/components/project-progress-card";
import { PageHeader } from "@/components/site/page-header";
import { FOUNDATION } from "@/lib/constants";
import { formatThaiDate } from "@/lib/format";
import { getFeaturedProject, getProjectUpdates } from "@/lib/queries";
import buildingPhoto from "../../../../public/photos/baan-takiang-building.jpg";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "โครงการวะกัฟ บ้านตะเกียง",
  description: `ร่วมวะกัฟสร้างบ้านตะเกียง บ้านพักและศูนย์การเรียนรู้สำหรับเด็กกำพร้า ${FOUNDATION.baanTakiangLocation} ติดตามความคืบหน้าการก่อสร้างได้ที่นี่`,
};

const WAQF_POINTS = [
  "วะกัฟ คือการอุทิศทรัพย์สินเพื่อประโยชน์ส่วนรวมตามหลักศาสนาอิสลาม ตัวทรัพย์สินคงอยู่ ส่วนประโยชน์ถูกส่งต่อไปเรื่อย ๆ",
  "บ้านตะเกียงเป็นทรัพย์สินวะกัฟของมูลนิธิ ใช้เป็นที่พักและพื้นที่เรียนรู้ของเด็กกำพร้ารุ่นต่อรุ่น",
  "ทุกการร่วมวะกัฟเป็นผลบุญที่ไหลต่อเนื่อง (ศอดะเกาะฮ์ ญารียะฮ์) ตราบที่ยังมีผู้ได้รับประโยชน์",
];

export default async function WaqfPage() {
  const project = await getFeaturedProject();
  if (!project) notFound();

  const updates = await getProjectUpdates(project.id);
  const photos = [...new Set(updates.flatMap((u) => [u.coverImageUrl, ...u.imageUrls]).filter((u): u is string => Boolean(u)))].slice(0, 12);
  const donateHref = project.fund ? `/donate?fund=${project.fund.slug}` : "/donate";
  const paragraphs = (project.description ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <PageHeader title={project.title} description={project.summary}>
        <p className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">โครงการวะกัฟ</span>
          <span className="flex items-center gap-1.5 text-white/80">
            <MapPin className="size-4" />
            {FOUNDATION.baanTakiangLocation}
          </span>
        </p>
      </PageHeader>

      {/* Overview */}
      <section className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary shadow-lg">
          <Image
            src={project.coverImageUrl ?? buildingPhoto}
            alt={project.title}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-5">
          <ProjectProgressCard project={project} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href={donateHref}>
                <HeartHandshake />
                ร่วมวะกัฟบ้านตะเกียง
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#updates">
                ดูความคืบหน้าทั้งหมด
                <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="rounded-xl border bg-accent/50 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="size-4 text-gold-deep" />
              ทำไมต้องวะกัฟ
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-foreground/85">
              {WAQF_POINTS.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rotate-45 bg-secondary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* About + bank account */}
      <section className="bg-muted/60 py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-4">
            <SectionHeading align="left" eyebrow="เกี่ยวกับโครงการ" title="บ้านพักและศูนย์การเรียนรู้สำหรับเด็กกำพร้า" />
            {(paragraphs.length ? paragraphs : [project.summary]).map((p, i) => (
              <p key={i} className="whitespace-pre-line text-foreground/85">
                {p}
              </p>
            ))}
          </div>
          {project.fund && (
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-primary">บัญชีสำหรับร่วมวะกัฟ</h2>
              <BankAccountCard fund={project.fund} />
              <p className="text-sm text-muted-foreground">
                โอนแล้วกรุณา{" "}
                <Link href={donateHref} className="font-medium text-primary underline underline-offset-4">
                  แจ้งการโอนและแนบสลิป
                </Link>{" "}
                เพื่อให้เจ้าหน้าที่ยืนยันยอด
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section id="updates" className="mx-auto w-full max-w-4xl scroll-mt-20 px-4 py-14">
        <SectionHeading eyebrow="ความคืบหน้า" title="อัปเดตการก่อสร้าง" description="รายงานความคืบหน้าจากหน้างานจริง เรียงจากล่าสุด" />
        {updates.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            ยังไม่มีรายงานความคืบหน้า ติดตามได้เร็ว ๆ นี้
          </p>
        ) : (
          <ol className="relative mt-10 flex flex-col gap-6 border-l-2 border-secondary/50 pl-6 sm:pl-8">
            {updates.map((u) => (
              <li key={u.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-5 -left-[33px] size-4 rounded-full border-4 border-background bg-secondary sm:-left-[41px]"
                />
                <article className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row">
                  <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48">
                    {u.coverImageUrl ? (
                      <Image src={u.coverImageUrl} alt="" fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/30">
                        <ImageIcon className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        <time dateTime={u.publishedAt?.toISOString()}>{formatThaiDate(u.publishedAt)}</time>
                      </span>
                      {u.progressPercent != null && (
                        <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-primary">
                          ความคืบหน้า {u.progressPercent}%
                        </span>
                      )}
                    </p>
                    <h3 className="text-lg font-semibold text-primary">
                      <Link href={`/activities/${u.slug}`} className="after:absolute after:inset-0">
                        {u.title}
                      </Link>
                    </h3>
                    {u.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{u.excerpt}</p>}
                    {u.progressPercent != null && (
                      <Progress value={u.progressPercent} className="mt-auto h-2" aria-label={`ความคืบหน้า ${u.progressPercent}%`} />
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-14">
          <SectionHeading eyebrow="ภาพบรรยากาศ" title="ภาพจากหน้างาน" />
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image src={url} alt="ภาพการก่อสร้างบ้านตะเกียง" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover transition-transform hover:scale-105" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-start gap-5 rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 className="text-2xl font-bold">ร่วมเป็นส่วนหนึ่งของบ้านตะเกียง</h2>
            <p className="text-white/80">ทุกบาทของท่านคืออิฐหนึ่งก้อนของบ้านที่ส่องทางให้น้อง ๆ</p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link href={donateHref}>
              <HeartHandshake />
              ร่วมวะกัฟเลย
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
