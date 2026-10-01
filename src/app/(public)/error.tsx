"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-primary">ขออภัย เกิดข้อผิดพลาด</h1>
      <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
      <Button onClick={reset}>ลองใหม่</Button>
    </div>
  );
}
