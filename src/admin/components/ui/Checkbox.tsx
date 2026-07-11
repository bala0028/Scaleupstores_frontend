import * as React from "react";
import MuiCheckbox from "@mui/material/Checkbox";

export interface AdminCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, AdminCheckboxProps>(
  ({ checked, onCheckedChange, disabled, className, id, ...props }, ref) => {
    return (
      <MuiCheckbox
        ref={ref}
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className={className}
        size="small"
        {...props}
      />
    );
  }
);
Checkbox.displayName = "AdminCheckbox";
