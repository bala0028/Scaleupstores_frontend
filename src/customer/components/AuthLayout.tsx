import { Navbar, Footer } from "@/customer/components";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function AuthLayout({ title, subtitle, children, maxWidth = "440px" }: AuthLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-brand-cream flex items-center justify-center px-4 py-10">
        <div
          className="w-full bg-white rounded-card border-[1.5px] border-brand-border shadow-card px-8 py-9"
          style={{ maxWidth }}
        >
          <h2 className={`text-center text-brand font-bold ${subtitle ? "mb-1" : "mb-6"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-center text-muted-foreground text-base mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
