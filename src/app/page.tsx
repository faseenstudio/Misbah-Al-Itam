import { FOUNDATION } from "@/lib/constants";

// Placeholder — the real landing page is built in Step 3.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-primary p-6 text-center text-primary-foreground">
      <h1 className="text-3xl font-bold sm:text-4xl">{FOUNDATION.nameTh}</h1>
      <p className="text-secondary">{FOUNDATION.nameEn}</p>
    </main>
  );
}
