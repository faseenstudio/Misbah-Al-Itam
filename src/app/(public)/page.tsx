import { About } from "@/components/home/about";
import { ContactCta } from "@/components/home/contact-cta";
import { FeaturedProject } from "@/components/home/featured-project";
import { FundGrid } from "@/components/home/fund-grid";
import { Hero } from "@/components/home/hero";
import { RecentActivities } from "@/components/home/recent-activities";
import { getFeaturedProject, getPublishedActivities } from "@/lib/queries";

// Render per request so approved donations and new posts appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [project, { items: activities }] = await Promise.all([
    getFeaturedProject(),
    getPublishedActivities({ take: 3 }),
  ]);

  return (
    <>
      <Hero />
      <About />
      {project && <FeaturedProject project={project} />}
      <FundGrid />
      <RecentActivities activities={activities} />
      <ContactCta />
    </>
  );
}
