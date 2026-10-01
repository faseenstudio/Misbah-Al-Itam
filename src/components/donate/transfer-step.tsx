import { ArrowLeft, ArrowRight, Info, Landmark } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FundIcon } from "@/components/fund-icon";
import { CopyButton } from "./copy-button";
import type { DonateFund } from "./types";

const INSTRUCTIONS = [
  "เปิดแอปธนาคารหรือ Mobile Banking ของท่าน",
  "โอนเงินเข้าบัญชีด้านบน ตามจำนวนที่ต้องการบริจาค",
  "บันทึกภาพสลิป (e-Slip) หลังโอนสำเร็จ",
  "กด “โอนแล้ว แนบสลิป” เพื่อแจ้งการโอนให้มูลนิธิ",
];

export function BankAccountCard({ fund }: { fund: DonateFund }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg sm:p-7">
      <div aria-hidden="true" className="absolute -top-16 -right-16 -z-10 size-56 rounded-full bg-secondary/20 blur-2xl" />
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-secondary">
          <FundIcon slug={fund.slug} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-white/70">กองทุน</span>
          <span className="text-lg font-semibold">{fund.nameTh}</span>
        </div>
      </div>

      <dl className="mt-6 grid gap-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-white/70">
            <Landmark className="size-3.5" />
            ธนาคาร
          </dt>
          <dd className="font-medium">{fund.bankName}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">ชื่อบัญชี</dt>
          <dd className="font-medium">{fund.accountName}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">เลขที่บัญชี</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl font-semibold tracking-wider text-secondary sm:text-3xl">
              {fund.accountNumber}
            </span>
            <CopyButton value={fund.accountNumber.replace(/\D/g, "")} label="คัดลอกเลขบัญชี" />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function TransferStep({
  fund,
  onBack,
  onNext,
}: {
  fund: DonateFund;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <BankAccountCard fund={fund} />

      <Alert variant="info">
        <Info />
        <AlertDescription>
          โปรดตรวจสอบว่าชื่อกองทุนและเลขบัญชีตรงกันก่อนโอน แต่ละกองทุนมีบัญชีแยกกัน
          เงินบริจาคจะถูกใช้ตามวัตถุประสงค์ของกองทุนที่ท่านเลือก
        </AlertDescription>
      </Alert>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 font-semibold text-primary">วิธีโอนเงิน</h3>
        <ol className="flex flex-col gap-3">
          {INSTRUCTIONS.map((text, i) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft />
          เปลี่ยนกองทุน
        </Button>
        <Button type="button" size="lg" onClick={onNext}>
          โอนแล้ว แนบสลิป
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
