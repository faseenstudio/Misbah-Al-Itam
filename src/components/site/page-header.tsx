import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div aria-hidden="true" className="absolute -top-24 right-0 -z-10 size-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:py-14">
        {children}
        <h1 className="text-2xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-white/80">{description}</p>}
      </div>
    </section>
  );
}
