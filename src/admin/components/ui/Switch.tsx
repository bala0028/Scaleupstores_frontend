import * as React from "react";
import MuiSwitch from "@mui/material/Switch";

export interface AdminSwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, AdminSwitchProps>(
  ({ id, checked, defaultChecked, onCheckedChange, disabled, className }, ref) => {
    return (
      <MuiSwitch
        ref={ref}
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className={className}
        size="small"
      />
    );
  }
);
Switch.displayName = "AdminSwitch";
