"use client";

import { useEffect, useReducer, useRef, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitDonation } from "@/app/(public)/donate/actions";
import { downscaleImage } from "@/lib/client-image";
import { formatBaht } from "@/lib/format";
import {
  donationSchema,
  firstFieldErrors,
  validateSlip,
  type DonationFieldErrors,
} from "@/lib/validation/donation";
import { DetailsStep, toLocalDateTimeInput } from "./details-step";
import { FundStep } from "./fund-step";
import { StepIndicator } from "./step-indicator";
import { TransferStep } from "./transfer-step";
import type { DonateFund, DonorValues, WizardState, WizardStep } from "./types";

type Action =
  | { type: "selectFund"; fundId: string }
  | { type: "goTo"; step: 1 | 2 | 3; now?: string }
  | { type: "setValue"; field: keyof DonorValues; value: DonorValues[keyof DonorValues] }
  | { type: "setSlip"; file: File | null; error?: string }
  | { type: "submitFailed"; errors: DonationFieldErrors; formError?: string }
  | { type: "submitted"; reference: string }
  | { type: "reset"; state: WizardState };

const STEP_TITLES: Record<WizardStep, string> = {
  1: "เลือกกองทุนที่ต้องการบริจาค",
  2: "โอนเงินเข้าบัญชีมูลนิธิ",
  3: "แจ้งการโอนและแนบสลิป",
  done: "ได้รับข้อมูลการบริจาคแล้ว",
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "selectFund":
      return { ...state, fundId: action.fundId, errors: { ...state.errors, fundId: undefined } };
    case "goTo": {
      const values =
        action.step === 3 && !state.values.transferredAt && action.now
          ? { ...state.values, transferredAt: action.now }
          : state.values;
      return { ...state, step: action.step, values, formError: null };
    }
    case "setValue":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
        formError: null,
      };
    case "setSlip":
      return { ...state, slip: action.file, errors: { ...state.errors, slip: action.error }, formError: null };
    case "submitFailed": {
      // A fund problem can only be fixed on step 1.
      const step = action.errors.fundId ? 1 : state.step;
      return { ...state, step, errors: action.errors, formError: action.formError ?? null };
    }
    case "submitted":
      return { ...state, step: "done", reference: action.reference, errors: {}, formError: null };
    case "reset":
      return action.state;
  }
}

const EMPTY_VALUES: DonorValues = {
  donorName: "",
  donorPhone: "",
  isAnonymous: false,
  amount: "",
  transferredAt: "",
  message: "",
};

function initialState(fundId: string | null): WizardState {
  return {
    // A fund chosen elsewhere on the site (?fund=…) skips straight to the bank details.
    step: fundId ? 2 : 1,
    fundId,
    values: EMPTY_VALUES,
    slip: null,
    errors: {},
    formError: null,
    reference: null,
  };
}

// Order used to focus the first invalid field after a failed submit.
const FIELD_ORDER = ["donorName", "donorPhone", "amount", "transferredAt", "slip", "message"] as const;

export function DonationWizard({ funds, initialFundId }: { funds: DonateFund[]; initialFundId: string | null }) {
  const [state, dispatch] = useReducer(reducer, initialFundId, initialState);
  const [pending, startTransition] = useTransition();

  const fund = funds.find((f) => f.id === state.fundId) ?? null;

  // Move focus to the step heading whenever the step changes (not on first render).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.step]);

  function goTo(step: 1 | 2 | 3) {
    dispatch({ type: "goTo", step, now: step === 3 ? toLocalDateTimeInput(new Date()) : undefined });
  }

  function canGoTo(step: 1 | 2 | 3) {
    return step === 1 || Boolean(fund);
  }

  function focusFirstError(errors: DonationFieldErrors) {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fund) return goTo(1);

    const { values, slip } = state;
    const parsed = donationSchema.safeParse({ fundId: fund.id, ...values, slip });
    if (!parsed.success) {
      const errors = firstFieldErrors(parsed.error);
      dispatch({ type: "submitFailed", errors });
      focusFirstError(errors);
      return;
    }

    const formData = new FormData();
    formData.set("fundId", fund.id);
    formData.set("donorName", values.donorName);
    formData.set("donorPhone", values.donorPhone);
    formData.set("isAnonymous", String(values.isAnonymous));
    formData.set("amount", values.amount);
    // Convert the donor's local wall-clock time to an absolute instant before it reaches the server.
    formData.set("transferredAt", parsed.data.transferredAt.toISOString());
    formData.set("message", values.message);
    formData.set("slip", parsed.data.slip);
    const honeypot = e.currentTarget.elements.namedItem("website");
    formData.set("website", honeypot instanceof HTMLInputElement ? honeypot.value : "");

    startTransition(async () => {
      try {
        const result = await submitDonation(formData);
        if (result.ok) {
          dispatch({ type: "submitted", reference: result.reference });
        } else {
          dispatch({ type: "submitFailed", errors: result.fieldErrors ?? {}, formError: result.formError });
          if (result.fieldErrors) focusFirstError(result.fieldErrors);
        }
      } catch {
        dispatch({
          type: "submitFailed",
          errors: {},
          formError: "ส่งข้อมูลไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <StepIndicator current={state.step} canGoTo={canGoTo} onGoTo={goTo} />

      <section aria-labelledby="donate-step-title" className="flex scroll-mt-24 flex-col gap-6">
        <h2
          id="donate-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-xl font-bold text-primary outline-none sm:text-2xl"
        >
          {STEP_TITLES[state.step]}
        </h2>

        {state.step === 1 && (
          <FundStep
            funds={funds}
            selectedId={state.fundId}
            error={state.errors.fundId}
            onSelect={(fundId) => dispatch({ type: "selectFund", fundId })}
            onNext={() => goTo(2)}
          />
        )}

        {state.step === 2 && fund && <TransferStep fund={fund} onBack={() => goTo(1)} onNext={() => goTo(3)} />}

        {state.step === 3 && fund && (
          <DetailsStep
            fund={fund}
            values={state.values}
            slip={state.slip}
            errors={state.errors}
            formError={state.formError}
            pending={pending}
            onChange={(field, value) => dispatch({ type: "setValue", field, value })}
            onSlipChange={async (picked) => {
              const file = picked
                ? await downscaleImage(picked, { maxDimension: 2400, quality: 0.9, keepIfSmallerThan: 2 * 1024 * 1024 })
                : null;
              dispatch({ type: "setSlip", file, error: file ? validateSlip(file) : undefined });
            }}
            onChangeFund={() => goTo(1)}
            onBack={() => goTo(2)}
            onSubmit={handleSubmit}
          />
        )}

        {state.step === "done" && fund && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-10 text-center shadow-sm">
            <CheckCircle2 className="size-16 text-success" strokeWidth={1.5} />
            <p className="text-lg font-semibold text-primary">ขอบคุณที่ร่วมบริจาค ขออัลลอฮ์ทรงตอบแทนความดีแก่ท่าน</p>
            <p className="max-w-md text-muted-foreground">
              ยอด {formatBaht(Number(state.values.amount))} เข้ากองทุน “{fund.nameTh}”
              ได้รับการบันทึกแล้ว เจ้าหน้าที่จะตรวจสอบสลิปกับรายการเดินบัญชีโดยเร็ว
            </p>
            {state.reference && (
              <p className="rounded-lg bg-accent px-4 py-2 text-sm">
                เลขอ้างอิง <span className="font-mono font-semibold text-primary">{state.reference}</span>
              </p>
            )}
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" />
              สถานะ: รอตรวจสอบ
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button variant="gold" onClick={() => dispatch({ type: "reset", state: initialState(null) })}>
                <HeartHandshake />
                บริจาคอีกครั้ง
              </Button>
              <Button asChild variant="outline">
                <Link href="/">กลับหน้าแรก</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
