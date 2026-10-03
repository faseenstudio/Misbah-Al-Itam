import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { requireAdmin } from "@/lib/dal";
import { ROLE_LABELS } from "@/lib/roles";

export const metadata = { title: "บัญชีของฉัน" };

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">บัญชีของฉัน</h1>
        <p className="text-muted-foreground">
          {admin.name} · {admin.email} · {ROLE_LABELS[admin.role]}
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-primary">เปลี่ยนรหัสผ่าน</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
