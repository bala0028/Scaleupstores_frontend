import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormRowProps {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormRow({ label, htmlFor, error, className, required, children }: FormRowProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="space-y-1">
        {children}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
