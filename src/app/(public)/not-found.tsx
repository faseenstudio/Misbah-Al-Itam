import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-5xl font-bold text-secondary">404</p>
      <h1 className="text-2xl font-bold text-primary">ไม่พบหน้าที่คุณต้องการ</h1>
      <Button asChild>
        <Link href="/">กลับหน้าแรก</Link>
      </Button>
    </div>
  );
}
