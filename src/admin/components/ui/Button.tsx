import * as React from "react";
import MuiButton from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

type AdminButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost";
type AdminButtonSize = "default" | "sm" | "lg" | "icon";

const VARIANT_MAP: Record<
  AdminButtonVariant,
  { variant: "text" | "outlined" | "contained"; color: "primary" | "secondary" | "error" | "inherit" }
> = {
  default: { variant: "contained", color: "primary" },
  destructive: { variant: "contained", color: "error" },
  outline: { variant: "outlined", color: "primary" },
  secondary: { variant: "contained", color: "secondary" },
  ghost: { variant: "text", color: "inherit" },
};

const SIZE_MAP: Record<Exclude<AdminButtonSize, "icon">, "small" | "medium" | "large"> = {
  default: "medium",
  sm: "small",
  lg: "large",
};

export interface AdminButtonProps {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  "aria-label"?: string;
  title?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ variant = "default", size = "default", className, onClick, disabled, children, type, ...props }, ref) => {
    const { variant: muiVariant, color } = VARIANT_MAP[variant];

    if (size === "icon") {
      return (
        <IconButton
          ref={ref}
          color={color === "inherit" ? "default" : color}
          disabled={disabled}
          className={className}
          type={type}
          onClick={onClick}
          {...props}
        >
          {children}
        </IconButton>
      );
    }

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={color}
        size={SIZE_MAP[size]}
        disabled={disabled}
        className={className}
        type={type}
        onClick={onClick}
        disableElevation
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);
Button.displayName = "AdminButton";
