import { cn } from "@/lib/utils";

/* ─── PageContainer ───────────────────────────────────────────── */
interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

export function PageContainer({ size = "xl", className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)}
      {...props}
    />
  );
}

/* ─── Section ─────────────────────────────────────────────────── */
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg" | "xl";
}

const sectionSpacing = {
  sm: "py-4",
  md: "py-6",
  lg: "py-8",
  xl: "py-12",
};

export function Section({ spacing = "md", className, ...props }: SectionProps) {
  return <section className={cn(sectionSpacing[spacing], className)} {...props} />;
}

/* ─── Grid ────────────────────────────────────────────────────── */
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const gridGaps = { sm: "gap-2", md: "gap-4", lg: "gap-6" };

export function Grid({ cols = 3, gap = "md", className, ...props }: GridProps) {
  return <div className={cn("grid", gridCols[cols], gridGaps[gap], className)} {...props} />;
}
