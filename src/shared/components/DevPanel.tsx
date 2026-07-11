/**
 * DEV PANEL — only rendered when import.meta.env.DEV is true.
 * Floating route navigator for visual QA.
 * Toggle: press backtick (`) or click the [DEV] button.
 */
import { useState, useEffect, CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { getAppMode } from "@/shared/utils";

type Tab = "admin" | "customer";

interface RouteItem {
  label: string;
  path: string;
  group?: string;
}

const ADMIN_ROUTES: RouteItem[] = [
  { label: "Sign In", path: "/auth/sign-in", group: "Auth" },
  { label: "Verify OTP", path: "/auth/verify-otp", group: "Auth" },
  { label: "Forgot Password", path: "/auth/forgot-password", group: "Auth" },
  { label: "Reset Password", path: "/auth/reset-password/test/test", group: "Auth" },
  { label: "Dashboard", path: "/dashboard/home", group: "Pages" },
  { label: "Admin Users", path: "/dashboard/AdminUser", group: "Pages" },
  { label: "Category", path: "/dashboard/category", group: "Pages" },
  { label: "Product", path: "/dashboard/product", group: "Pages" },
  { label: "Product Variant", path: "/dashboard/product-variant", group: "Pages" },
  { label: "Offers", path: "/dashboard/offer", group: "Pages" },
  { label: "Orders", path: "/dashboard/orders", group: "Pages" },
  { label: "Master Data", path: "/dashboard/master_data", group: "Pages" },
  { label: "Customers", path: "/dashboard/customer_details", group: "Pages" },
  { label: "Contact Us", path: "/dashboard/contact_us", group: "Pages" },
  { label: "Reviews", path: "/dashboard/review", group: "Pages" },
  { label: "Print Address", path: "/dashboard/print_address", group: "Pages" },
];

const CUSTOMER_ROUTES: RouteItem[] = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/product" },
  { label: "Product Detail", path: "/product/1" },
  { label: "Cart", path: "/cart" },
  { label: "Checkout", path: "/checkout" },
  { label: "Login", path: "/login" },
  { label: "Register", path: "/register" },
  { label: "Verification", path: "/verify" },
  { label: "Order History", path: "/orderhistory" },
  { label: "Order Tracking", path: "/order-tracking/1" },
  { label: "Order Confirmation", path: "/order-confirmation" },
  { label: "Favorites", path: "/favoriteProducts" },
  { label: "Profile", path: "/profile" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Policies", path: "/policies" },
  { label: "Search", path: "/search" },
  { label: "Password Reset", path: "/password-reset" },
  { label: "Password Reset Confirm", path: "/password-reset-confirm/test/test" },
];

// All styles inline — completely isolated from Bootstrap / Tailwind
const s: Record<string, CSSProperties> = {
  toggleBtn: {
    position: "fixed",
    bottom: 16,
    right: 16,
    zIndex: 99999,
    background: "#0f172a",
    color: "#64748b",
    border: "1px solid #1e293b",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 11,
    fontFamily: "monospace",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: 230,
    height: "100vh",
    background: "#0f172a",
    borderLeft: "1px solid #1e293b",
    zIndex: 99998,
    display: "flex",
    flexDirection: "column",
    fontFamily: "monospace",
    fontSize: 12,
    boxShadow: "-4px 0 24px rgba(0,0,0,0.5)",
  },
  header: {
    padding: "10px 12px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#475569",
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid #1e293b",
  },
  routeList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "4px 0",
  },
  groupLabel: {
    padding: "10px 12px 3px",
    color: "#334155",
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  footer: {
    padding: "8px 12px",
    borderTop: "1px solid #1e293b",
    color: "#334155",
    fontSize: 10,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
};

const THEMES = ["customer", "customer-alt", "vannakkarangal", "admin"] as const;
type Theme = (typeof THEMES)[number];

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(() => getAppMode());
  const [hovered, setHov] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() =>
    getAppMode() === "admin" ? "admin" : "customer"
  );
  const location = useLocation();
  const currentMode = getAppMode();

  // Apply data-theme to both the wrapper div AND documentElement
  // (documentElement is needed so shadcn Portal components like dropdowns inherit the theme)
  useEffect(() => {
    const el = document.querySelector("[data-theme]");
    if (el) el.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Backtick toggles the panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Switching modes requires a full page reload (getAppMode reads window.location)
  const go = (path: string) => {
    window.location.href = path;
  };

  const routes = tab === "admin" ? ADMIN_ROUTES : CUSTOMER_ROUTES;

  const modeBadge: CSSProperties = {
    background: currentMode === "admin" ? "#422006" : "#0c1a2e",
    color: currentMode === "admin" ? "#fb923c" : "#60a5fa",
    padding: "2px 7px",
    borderRadius: 4,
    fontSize: 10,
    letterSpacing: "0.05em",
  };

  return (
    <>
      {/* Toggle button — bottom-right */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{ ...s.toggleBtn, opacity: open ? 0.3 : 0.6 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = open ? "0.3" : "0.6")}
        title="Dev Panel (press ` to toggle)"
      >
        [DEV]
      </button>

      {/* Side panel */}
      {open && (
        <div style={s.panel}>
          {/* Header */}
          <div style={s.header}>
            <span style={s.headerTitle}>Dev Panel</span>
            <span style={modeBadge}>{currentMode}</span>
          </div>

          {/* App tabs */}
          <div style={s.tabRow}>
            {(["admin", "customer"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  background: tab === t ? "#1e293b" : "transparent",
                  color: tab === t ? "#f1f5f9" : "#475569",
                  border: "none",
                  borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "monospace",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Route list */}
          <div style={s.routeList}>
            {routes.map((route, i) => {
              const isActive = location.pathname === route.path;
              const isHovered = hovered === route.path;
              const prevGroup = i > 0 ? routes[i - 1].group : null;
              const showGroup = route.group && route.group !== prevGroup;

              return (
                <div key={route.path}>
                  {showGroup && <div style={s.groupLabel}>{route.group}</div>}
                  <button
                    onClick={() => go(route.path)}
                    onMouseEnter={() => setHov(route.path)}
                    onMouseLeave={() => setHov(null)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "5px 12px",
                      background: isActive ? "#1e3a5f" : isHovered ? "#1e293b" : "transparent",
                      color: isActive ? "#93c5fd" : "#94a3b8",
                      border: "none",
                      borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "monospace",
                      transition: "background 0.1s",
                    }}
                  >
                    {route.label}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Theme switcher */}
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid #1e293b",
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: "100%",
                color: "#334155",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 2,
              }}
            >
              Theme
            </span>
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: "3px 8px",
                  fontSize: 10,
                  fontFamily: "monospace",
                  border: theme === t ? "1px solid #3b82f6" : "1px solid #334155",
                  borderRadius: 4,
                  background: theme === t ? "#1e3a5f" : "transparent",
                  color: theme === t ? "#93c5fd" : "#64748b",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Footer — current path for easy bug reporting */}
          <div style={s.footer}>
            <span style={{ color: "#475569" }}>path:</span>
            <span
              style={{ color: "#64748b", wordBreak: "break-all", cursor: "pointer" }}
              onClick={() => navigator.clipboard?.writeText(location.pathname)}
              title="Click to copy"
            >
              {location.pathname}
            </span>
            <span style={{ marginTop: 4 }}>` to close</span>
          </div>
        </div>
      )}
    </>
  );
}
