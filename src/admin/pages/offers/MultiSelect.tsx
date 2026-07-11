import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";

interface MultiSelectOption {
  id: number | string;
  name: string;
}

interface MultiSelectProps {
  label: string;
  placeholder: string;
  selectAllLabel: string;
  options: MultiSelectOption[];
  selected: string[];
  disabled?: boolean;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  toggleOption: (id: string) => void;
  toggleAll: () => void;
  hideLabel?: boolean;
}

export function MultiSelect({
  label,
  placeholder,
  selectAllLabel,
  options,
  selected,
  disabled,
  dropdownOpen,
  setDropdownOpen,
  toggleOption,
  toggleAll,
  hideLabel = false,
}: MultiSelectProps) {
  const isDisabled = disabled || !options.length;

  return (
    <div className="space-y-1.5">
      {!hideLabel && <Label>{label}</Label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => !isDisabled && setDropdownOpen(!dropdownOpen)}
          disabled={isDisabled}
          className={`w-full border rounded-md px-3 py-2 text-left text-sm flex justify-between items-center ${
            isDisabled ? "bg-muted cursor-not-allowed" : "bg-white hover:border-ring"
          }`}
        >
          <span>
            {selected.length === 0
              ? placeholder
              : selected.length === options.length
                ? `All ${label} Selected`
                : `${selected.length} ${label}${selected.length > 1 ? "s" : ""} Selected`}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border rounded-md shadow-md z-50">
            <div
              onClick={toggleAll}
              className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.length === options.length && options.length > 0}
                readOnly
              />
              <span className="text-sm font-medium">{selectAllLabel}</span>
            </div>
            <div className="border-t" />
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => toggleOption(String(opt.id))}
                className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
              >
                <input type="checkbox" checked={selected.includes(String(opt.id))} readOnly />
                <span className="text-sm">{opt.name}</span>
              </div>
            ))}
            <div className="sticky bottom-0 bg-white border-t py-2 flex justify-center">
              <Button size="sm" variant="outline" onClick={() => setDropdownOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
