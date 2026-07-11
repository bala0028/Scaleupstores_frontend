import { useRef, useState, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";

interface FileInputProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  existingFileName?: string;
  error?: string;
  hideLabel?: boolean;
}

export function FileInput({
  label,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp",
  existingFileName = "",
  error,
  hideLabel = false,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileName = value?.name || existingFileName;

  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      {!hideLabel && <label className="text-sm font-medium">{label}</label>}
      <div
        className={`border rounded-md px-3 py-2.5 flex items-center gap-2 bg-white cursor-pointer transition-colors ${
          error ? "border-destructive" : "border-input hover:border-ring"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {!fileName && <ImageIcon className="h-5 w-5 text-muted-foreground" />}
        {preview && <img src={preview} alt="preview" className="h-7 w-7 object-cover rounded" />}
        <span className={`text-sm truncate flex-1 ${fileName ? "" : "text-muted-foreground"}`}>
          {fileName || "Choose image..."}
        </span>
        {fileName && (
          <button
            type="button"
            className="ml-auto rounded-full p-1 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current) inputRef.current.value = "";
              onChange(null);
            }}
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
