import config from "@/shared/config/clientConfig";
import { Input } from "@/components/ui/input";
import type { CheckoutInput } from "@/shared/schemas/checkout";

interface CustomerFieldsProps {
  formData: CheckoutInput;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutInput>>;
}

export function CustomerFields({ formData, setFormData }: CustomerFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-brand text-sm font-medium mb-1.5 ml-1 required">First name</label>
        <Input
          type="text"
          maxLength={15}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={formData.first_name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-brand text-sm font-medium mb-1.5 ml-1">Last name (optional)</label>
        <Input
          type="text"
          maxLength={15}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          value={formData.last_name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-brand text-sm font-medium mb-1.5 ml-1 required">Contact Number</label>
        <Input
          type="text"
          minLength={10}
          maxLength={10}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          required
          value={formData.contact_number || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, contact_number: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-brand text-sm font-medium mb-1.5 ml-1">Secondary Contact</label>
        <Input
          type="text"
          minLength={10}
          maxLength={10}
          className="rounded-full bg-transparent border-brand-border-light text-brand h-12 px-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand transition-all"
          value={formData.secondary_number || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, secondary_number: e.target.value }))}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-brand text-sm font-medium mb-1.5 ml-1 required">Preferred Courier</label>
        <select
          className="w-full rounded-full bg-transparent border border-brand-border-light text-brand h-12 px-4 outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all appearance-none"
          required
          value={formData.preferredCourier || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, preferredCourier: e.target.value }))}
        >
          <option value="">Select Courier</option>
          {config.couriers.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
