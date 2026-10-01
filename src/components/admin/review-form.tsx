"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CircleCheck, CircleX, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewDonation, type ReviewState } from "@/app/admin/(panel)/donations/actions";
import { cn } from "@/lib/utils";

const REJECT_REASONS = [
  "ไม่พบยอดเงินเข้าบัญชีมูลนิธิ",
  "จำนวนเงินไม่ตรงกับสลิป",
  "สลิปไม่ชัดเจน อ่านไม่ได้",
  "สลิปซ้ำกับรายการอื่น",
  "โอนเข้าบัญชีกองทุนอื่น",
];

export function ReviewForm({ donationId }: { donationId: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(reviewDonation, {});
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [note, setNote] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={donationId} />

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {mode === "reject" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">เหตุผลที่ไม่ผ่าน</Label>
            <div className="flex flex-wrap gap-2">
              {REJECT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setNote(reason)}
                  aria-pressed={note === reason}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    note === reason ? "border-destructive bg-destructive/10 text-destructive" : "bg-card hover:bg-accent",
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Textarea id="note" name="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} required maxLength={500} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setMode("idle")} disabled={pending}>
              ยกเลิก
            </Button>
            <Button type="submit" name="decision" value="REJECTED" variant="destructive" disabled={pending || !note.trim()}>
              {pending ? <Loader2 className="animate-spin" /> : <CircleX />}
              ยืนยันว่าไม่ผ่าน
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            ตรวจว่ามียอดเงินเข้าบัญชีกองทุนนี้ จำนวนเงินและเวลาตรงกับสลิป ก่อนกดยืนยัน
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" name="decision" value="APPROVED" size="lg" className="flex-1 bg-success hover:bg-success/90" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <CircleCheck />}
              ยืนยันการบริจาค
            </Button>
            <Button type="button" size="lg" variant="outline" className="flex-1 text-destructive" onClick={() => setMode("reject")} disabled={pending}>
              <CircleX />
              ไม่ผ่าน
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
