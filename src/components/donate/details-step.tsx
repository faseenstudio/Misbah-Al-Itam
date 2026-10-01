"use client";

import type { FormEvent, ReactNode } from "react";
import { AlertCircle, ArrowLeft, HeartHandshake, Loader2, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FundIcon } from "@/components/fund-icon";
import type { DonationField, DonationFieldErrors } from "@/lib/validation/donation";
import { cn } from "@/lib/utils";
import { FileDrop } from "./file-drop";
import type { DonateFund, DonorValues } from "./types";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span>
        ) : (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** aria props tying an input to its hint / error text. */
function describe(id: string, error?: string, hasHint = false) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const;
}

export function toLocalDateTimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DetailsStep({
  fund,
  values,
  slip,
  errors,
  formError,
  pending,
  onChange,
  onSlipChange,
  onChangeFund,
  onBack,
  onSubmit,
}: {
  fund: DonateFund;
  values: DonorValues;
  slip: File | null;
  errors: DonationFieldErrors;
  formError: string | null;
  pending: boolean;
  onChange: <K extends keyof DonorValues>(field: K, value: DonorValues[K]) => void;
  onSlipChange: (file: File | null) => void;
  onChangeFund: () => void;
  onBack: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const err = (field: DonationField) => errors[field];

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-6">
      {/* Honeypot for bots — invisible and unreachable for people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {/* Selected fund summary */}
      <div className="flex items-center gap-3 rounded-xl border bg-accent/50 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
          <FundIcon slug={fund.slug} className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-xs text-muted-foreground">บริจาคเข้ากองทุน</span>
          <span className="font-semibold text-primary">{fund.nameTh}</span>
          <span className="font-mono text-sm text-gold-deep">{fund.accountNumber}</span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onChangeFund}>
          เปลี่ยน
        </Button>
      </div>

      <Field id="donorName" label="ชื่อ-นามสกุลผู้บริจาค" error={err("donorName")}>
        <Input
          id="donorName"
          name="donorName"
          autoComplete="name"
          value={values.donorName}
          onChange={(e) => onChange("donorName", e.target.value)}
          placeholder="เช่น สมชาย ใจดี หรือ ครอบครัวใจดี"
          {...describe("donorName", err("donorName"))}
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.isAnonymous}
            onChange={(e) => onChange("isAnonymous", e.target.checked)}
            className="size-5 rounded accent-primary"
          />
          ไม่ประสงค์ออกนาม (ไม่แสดงชื่อในรายชื่อผู้บริจาค)
        </label>
      </Field>

      <Field
        id="donorPhone"
        label="เบอร์โทรศัพท์"
        optional
        hint="ใช้ติดต่อกลับกรณีสลิปไม่ชัดเจนเท่านั้น"
        error={err("donorPhone")}
      >
        <Input
          id="donorPhone"
          name="donorPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.donorPhone}
          onChange={(e) => onChange("donorPhone", e.target.value)}
          placeholder="08x-xxx-xxxx"
          {...describe("donorPhone", err("donorPhone"), true)}
        />
      </Field>

      <Field id="amount" label="จำนวนเงินที่โอน (บาท)" error={err("amount")}>
        <div className="relative">
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            value={values.amount}
            onChange={(e) => onChange("amount", e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0"
            className="pr-14 text-lg font-semibold"
            {...describe("amount", err("amount"))}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
            บาท
          </span>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="เลือกจำนวนเงินด่วน">
          {QUICK_AMOUNTS.map((amount) => {
            const active = values.amount === String(amount);
            return (
              <button
                key={amount}
                type="button"
                onClick={() => onChange("amount", String(amount))}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none",
                  active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:border-secondary hover:bg-accent",
                )}
              >
                {amount.toLocaleString("th-TH")}
              </button>
            );
          })}
        </div>
      </Field>

      <Field id="transferredAt" label="วันและเวลาที่โอน (ตามสลิป)" error={err("transferredAt")}>
        <Input
          id="transferredAt"
          name="transferredAt"
          type="datetime-local"
          value={values.transferredAt}
          max={toLocalDateTimeInput(new Date())}
          onChange={(e) => onChange("transferredAt", e.target.value)}
          {...describe("transferredAt", err("transferredAt"))}
        />
      </Field>

      <Field id="slip" label="แนบสลิปการโอนเงิน (e-Slip)" error={err("slip")}>
        <FileDrop
          id="slip"
          file={slip}
          invalid={Boolean(err("slip"))}
          describedBy={err("slip") ? "slip-error" : undefined}
          onChange={onSlipChange}
        />
      </Field>

      <Field id="message" label="ข้อความ / ดุอาอ์ ถึงมูลนิธิ" optional error={err("message")}>
        <Textarea
          id="message"
          name="message"
          rows={3}
          maxLength={500}
          value={values.message}
          onChange={(e) => onChange("message", e.target.value)}
          placeholder="เช่น อุทิศผลบุญให้แก่บิดามารดา"
          {...describe("message", err("message"))}
        />
      </Field>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-success" />
        ข้อมูลของท่านใช้เพื่อการตรวจสอบการบริจาคเท่านั้น สลิปจะถูกเก็บเป็นความลับและเห็นได้เฉพาะเจ้าหน้าที่มูลนิธิ
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={pending}>
          <ArrowLeft />
          ดูเลขบัญชีอีกครั้ง
        </Button>
        <Button type="submit" variant="gold" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <HeartHandshake />}
          {pending ? "กำลังส่งข้อมูล..." : "ยืนยันการแจ้งโอน"}
        </Button>
      </div>
    </form>
  );
}
