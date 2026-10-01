import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";

export const metadata: Metadata = {
  title: "บริจาค",
};

// Placeholder — the multi-step donation form (fund → bank details → slip upload) is built in Step 4.
export default function DonatePage() {
  return (
    <>
      <PageHeader title="บริจาค" description="เลือกกองทุน โอนเงิน และแนบสลิปเพื่อยืนยันการบริจาค" />
      <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center text-muted-foreground">
        แบบฟอร์มบริจาคออนไลน์กำลังจะเปิดให้บริการ
      </div>
    </>
  );
}
