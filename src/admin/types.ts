import type { ChangeEvent, ReactNode } from "react";

// ─── Dialog Page Props ───────────────────────────────────────────
// Used by all admin Add/Edit/View dialog pages.
// Each page picks only the fields it needs via destructuring.

export interface DialogPageProps {
  open: boolean;
  handleOpenClose: (value: boolean) => void;
  refresh?: () => void;
  /** Generic entity ID — used by Edit/View pages */
  entityId?: string | number | null;
}

// ─── Form Field Props ────────────────────────────────────────────
// Used by inline FormField helper components in CRUD pages.

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  children?: ReactNode;
  name?: string;
  accept?: string;
  multiple?: boolean;
  rows?: number;
}
