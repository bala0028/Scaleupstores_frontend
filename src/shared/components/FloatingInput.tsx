/**
 * FloatingInput — replicates Material Tailwind's Input with floating label.
 * Label sits centred inside the input at rest (no extra top padding).
 * On focus or when filled: label floats to the top border, shrinks.
 */
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  /** Element rendered on the right (e.g. show/hide password button) */
  suffix?: ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, suffix, className, value, onFocus, onBlur, required, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const filled = typeof value === "string" && value.length > 0;
    const floating = focused || filled;

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          value={value}
          required={required}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            // Consistent padding — text is always vertically centred
            // The label overlays the empty field; when filled/focused it floats up
            "w-full rounded-lg border bg-transparent px-3 py-3.5 text-sm text-gray-900 outline-none",
            "transition-colors duration-200 shadow-sm",
            focused && !error ? "border-blue-500 shadow-md" : "border-gray-300",
            error ? "border-red-500" : "",
            suffix ? "pr-10" : "",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />

        {/* Label — centred at rest, floats to top border on focus / fill */}
        <label
          className={cn(
            "pointer-events-none absolute left-3 select-none bg-white transition-all duration-200",
            floating
              ? "top-0 -translate-y-1/2 px-0.5 text-[11px] font-medium"
              : "top-1/2 -translate-y-1/2 text-sm font-normal",
            floating && focused && !error
              ? "text-blue-500"
              : floating && error
                ? "text-red-500"
                : "text-gray-500"
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </label>

        {/* Suffix (e.g. show/hide password icon) */}
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
