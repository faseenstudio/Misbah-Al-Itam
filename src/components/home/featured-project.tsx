import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectProgressCard, type FeaturedProjectData } from "@/components/project-progress-card";
import { FOUNDATION } from "@/lib/constants";
import buildingPhoto from "../../../public/photos/baan-takiang-building.jpg";

export function FeaturedProject({ project }: { project: FeaturedProjectData }) {
  const donateHref = project.fund ? `/donate?fund=${project.fund.slug}` : "/donate";

  return (
    <section id="waqf" className="scroll-mt-20 bg-accent/60 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary shadow-lg">
          <Image
            src={project.coverImageUrl ?? buildingPhoto}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          <span className="absolute top-4 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow">
            โครงการเด่น · วะกัฟ
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">{project.title}</h2>
          <p className="flex items-center gap-1.5 text-sm font-medium text-gold-deep">
            <MapPin className="size-4" />
            {FOUNDATION.baanTakiangLocation}
          </p>
          <p className="text-muted-foreground">{project.summary}</p>

          <ProjectProgressCard project={project} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href={donateHref}>
                <HeartHandshake />
                ร่วมวะกัฟบ้านตะเกียง
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/waqf">
                รายละเอียดโครงการ
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
