import type { DonationFieldErrors } from "@/lib/validation/donation";

/** Fund fields the public donation form needs (serializable for Client Components). */
export type DonateFund = {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type WizardStep = 1 | 2 | 3 | "done";

export type DonorValues = {
  donorName: string;
  donorPhone: string;
  isAnonymous: boolean;
  amount: string;
  /** `datetime-local` value in the donor's own timezone, e.g. 2026-10-01T14:05 */
  transferredAt: string;
  message: string;
};

export type WizardState = {
  step: WizardStep;
  fundId: string | null;
  values: DonorValues;
  slip: File | null;
  errors: DonationFieldErrors;
  formError: string | null;
  reference: string | null;
};
