import { Input } from "@/components/ui/input";
import type { CheckoutInput } from "@/shared/schemas/checkout";

interface AddressFieldsProps {
  prefix: "billing" | "shipping";
  formData: CheckoutInput;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutInput>>;
  onPincodeChange: (pincode: string, type: string) => void;
}

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className={`block text-brand text-sm font-medium mb-1.5 ml-1${required ? " required" : ""}`}>{label}</label>
    {children}
  </div>
);

export function AddressFields({ prefix, formData, setFormData, onPincodeChange }: AddressFieldsProps) {
  const f = (name: string) => `${prefix}_${name}` as keyof CheckoutInput;

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = f(field);
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <>
      <Field label="House / Flat / Door No" required>
        <Input
          type="text"
          maxLength={30}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={(formData[f("door")] as string) || ""}
          onChange={handleChange("door")}
        />
      </Field>

      <Field label="Street / Road Name" required>
        <Input
          type="text"
          maxLength={50}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={(formData[f("street")] as string) || ""}
          onChange={handleChange("street")}
        />
      </Field>

      <Field label="Area / Locality" required>
        <Input
          type="text"
          maxLength={50}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={(formData[f("area")] as string) || ""}
          onChange={handleChange("area")}
        />
      </Field>

      <Field label="Landmark">
        <Input
          type="text"
          maxLength={50}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          value={(formData[f("landmark")] as string) || ""}
          onChange={handleChange("landmark")}
        />
      </Field>

      <Field label="Pincode" required>
        <Input
          type="text"
          minLength={6}
          maxLength={6}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={(formData[f("pincode")] as string) || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!/^\d*$/.test(val)) return;
            setFormData((prev) => ({ ...prev, [f("pincode")]: val }));
            if (val.length === 6) onPincodeChange(val, prefix);
          }}
        />
      </Field>

      <Field label="City">
        <Input
          type="text"
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          disabled
          value={(formData[f("city")] as string) || ""}
          onChange={handleChange("city")}
        />
      </Field>

      <Field label="State">
        <Input
          type="text"
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          disabled
          value={(formData[f("state")] as string) || ""}
          onChange={handleChange("state")}
        />
      </Field>
    </>
  );
}
