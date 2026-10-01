import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoMark } from "@/components/site/logo";
import { getAdmin } from "@/lib/dal";
import { FOUNDATION } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบผู้ดูแล", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-16" />
          <div>
            <h1 className="text-xl font-bold text-primary">ระบบผู้ดูแล</h1>
            <p className="text-sm text-muted-foreground">{FOUNDATION.nameTh}</p>
          </div>
        </div>
        <LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />
      </div>
    </main>
  );
}
