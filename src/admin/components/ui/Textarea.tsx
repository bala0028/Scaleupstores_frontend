import * as React from "react";
import TextField from "@mui/material/TextField";

export interface AdminTextareaProps {
  id?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  rows?: number;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ id, value, onChange, disabled, required, placeholder, className, name, rows = 4, maxLength }, ref) => {
    return (
      <TextField
        id={id}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={className}
        name={name}
        multiline
        rows={rows}
        size="small"
        fullWidth
        variant="outlined"
        inputRef={ref}
        slotProps={{ htmlInput: { maxLength } }}
      />
    );
  }
);
Textarea.displayName = "AdminTextarea";
