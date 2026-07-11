import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type FieldType = "text" | "email" | "password" | "tel" | "number" | "select" | "textarea" | "file";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: FieldType;
  error?: string;
  required?: boolean;
  options?: Option[];
  rows?: number;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, type = "text", error, required, options, rows, className, ...props }, ref) => {
    const id = props.name || props.id;
    return (
      <div>
        {label && (
          <Label htmlFor={id} className="block text-sm font-medium mb-1">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        {type === "select" ? (
          <select
            id={id}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 ${className ?? ""}`}
            {...(props as any)}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <Textarea id={id} rows={rows} className={className} {...(props as any)} />
        ) : (
          <Input id={id} type={type} ref={ref} className={className} {...props} />
        )}
        {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
