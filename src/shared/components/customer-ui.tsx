import { cn } from "@/lib/utils";
import { getImageUrl } from "@/shared/utils";
import { Loader2, ShoppingCart, Heart, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── LoadingSpinner ──────────────────────────────────────────── */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullPage?: boolean;
}

const spinnerSizes = { sm: "size-4", md: "size-6", lg: "size-8" };

export function LoadingSpinner({ size = "md", className, fullPage }: LoadingSpinnerProps) {
  const spinner = (
    <Loader2 className={cn("animate-spin text-success", spinnerSizes[size], className)} />
  );
  if (!fullPage) return spinner;
  return <div className="flex min-h-[50vh] items-center justify-center">{spinner}</div>;
}

/* ─── PriceDisplay ────────────────────────────────────────────── */
interface PriceDisplayProps {
  price: number | string;
  originalPrice?: number | string;
  className?: string;
}

function toNum(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) || 0 : v;
}

export function PriceDisplay({ price, originalPrice, className }: PriceDisplayProps) {
  const current = toNum(price);
  const original = originalPrice != null ? toNum(originalPrice) : null;
  const hasDiscount = original != null && original > current;

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-semibold">₹{current.toLocaleString()}</span>
      {hasDiscount && <s className="text-sm text-muted-foreground">₹{original.toLocaleString()}</s>}
    </span>
  );
}

/* ─── EmptyState ──────────────────────────────────────────────── */
type EmptyVariant = "cart" | "favorites" | "search" | "orders" | "generic";

const emptyConfig: Record<
  EmptyVariant,
  { icon: React.ElementType; title: string; description: string }
> = {
  cart: {
    icon: ShoppingCart,
    title: "Your cart is empty",
    description: "Add some products to get started",
  },
  favorites: {
    icon: Heart,
    title: "No favorites yet",
    description: "Save products you love for later",
  },
  search: { icon: Search, title: "No results found", description: "Try a different search term" },
  orders: {
    icon: Package,
    title: "No orders yet",
    description: "Your order history will appear here",
  },
  generic: { icon: Package, title: "Nothing here", description: "" },
};

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = emptyConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <Icon className="size-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">{title ?? config.title}</h3>
      {(description ?? config.description) && (
        <p className="mt-1 text-sm text-muted-foreground">{description ?? config.description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── ProductImage ────────────────────────────────────────────── */
interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const FALLBACK = "/placeholder-product.png";

export function ProductImage({
  src,
  alt,
  fallback = FALLBACK,
  className,
  ...props
}: ProductImageProps) {
  return (
    <img
      src={getImageUrl(src) || fallback}
      alt={alt ?? "Product"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
      className={cn("object-cover", className)}
      loading="lazy"
      {...props}
    />
  );
}

/* ─── QuantitySelector ────────────────────────────────────────── */
interface QuantitySelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove?: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  value,
  onIncrement,
  onDecrement,
  onRemove,
  min = 1,
  max,
  size = "sm",
  className,
}: QuantitySelectorProps) {
  const btnSize = size === "sm" ? "size-7 text-xs" : "size-9 text-sm";

  return (
    <div className={cn("inline-flex items-center rounded-md border border-border", className)}>
      <button
        type="button"
        onClick={value <= min && onRemove ? onRemove : onDecrement}
        disabled={value <= min && !onRemove}
        className={cn(
          "flex items-center justify-center rounded-l-md hover:bg-muted disabled:opacity-50",
          btnSize
        )}
        aria-label={value <= min && onRemove ? "Remove item" : "Decrease quantity"}
      >
        {value <= min && onRemove ? "✕" : "−"}
      </button>
      <span
        className={cn(
          "flex items-center justify-center border-x border-border font-medium",
          btnSize,
          "w-8"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={max != null && value >= max}
        className={cn(
          "flex items-center justify-center rounded-r-md hover:bg-muted disabled:opacity-50",
          btnSize
        )}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
