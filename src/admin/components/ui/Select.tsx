import * as React from "react";
import FormControl from "@mui/material/FormControl";
import MuiSelect, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface SelectRootProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SelectTrigger({ children }: { children?: React.ReactNode; className?: string }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string; children?: React.ReactNode }) {
  return <>{placeholder}</>;
}

export function SelectContent({ children }: { children?: React.ReactNode; className?: string }) {
  return <>{children}</>;
}

export function SelectItem({
  children,
}: {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  return <>{children}</>;
}

interface ParsedItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function parseChildren(children: React.ReactNode): { placeholder?: string; items: ParsedItem[] } {
  let placeholder: string | undefined;
  const items: ParsedItem[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === SelectTrigger) {
      const triggerProps = child.props as { children?: React.ReactNode };
      React.Children.forEach(triggerProps.children, (triggerChild) => {
        if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
          placeholder = (triggerChild.props as { placeholder?: string }).placeholder;
        }
      });
    } else if (child.type === SelectContent) {
      const contentProps = child.props as { children?: React.ReactNode };
      React.Children.forEach(contentProps.children, (item) => {
        if (React.isValidElement(item) && item.type === SelectItem) {
          const p = item.props as { value: string; children?: React.ReactNode; disabled?: boolean };
          items.push({ value: p.value, label: p.children, disabled: p.disabled });
        }
      });
    }
  });

  return { placeholder, items };
}

export function Select({ value, onValueChange, children, disabled, className }: SelectRootProps) {
  const { placeholder, items } = parseChildren(children);

  const handleChange = (event: SelectChangeEvent) => {
    onValueChange?.(event.target.value);
  };

  return (
    <FormControl size="small" fullWidth disabled={disabled} className={className}>
      <MuiSelect
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        MenuProps={{
          disableScrollLock: true,
        }}
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ color: "var(--color-muted-foreground, #6b7280)" }}>{placeholder}</span>;
          }
          const item = items.find((i) => i.value === selected);
          return item ? item.label : selected;
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
