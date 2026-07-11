import type { ReactNode } from "react";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageLayout({ title, description, actions, children }: AdminPageLayoutProps) {
  return (
    <div className="p-6">
      <div className="bg-card shadow-sm rounded-xl min-h-[calc(100vh-140px)] flex flex-col">
        <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="w-full lg:w-auto">{actions}</div>}
        </div>
        <div className="px-8 pb-8">{children}</div>
      </div>
    </div>
  );
}
