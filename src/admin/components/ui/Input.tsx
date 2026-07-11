import * as React from "react";
import TextField from "@mui/material/TextField";

export interface AdminInputProps {
  id?: string;
  type?: React.HTMLInputTypeAttribute;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  step?: string | number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  autoComplete?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (
    {
      id,
      type = "text",
      value,
      onChange,
      onClick,
      disabled,
      readOnly,
      required,
      placeholder,
      className,
      name,
      min,
      max,
      maxLength,
      step,
      inputMode,
      autoFocus,
      autoComplete,
      startAdornment,
      endAdornment,
    },
    ref
  ) => {
    return (
      <TextField
        id={id}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={className}
        name={name}
        autoFocus={autoFocus}
        size="small"
        fullWidth
        variant="outlined"
        inputRef={ref}
        slotProps={{
          htmlInput: { readOnly, min, max, maxLength, step, inputMode, autoComplete },
          input: { startAdornment, endAdornment },
        }}
      />
    );
  }
);
Input.displayName = "AdminInput";
