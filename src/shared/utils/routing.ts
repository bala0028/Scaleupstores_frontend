export type AppMode = "admin" | "customer";

export function getAppMode(): AppMode {
  const { hostname, pathname } = window.location;

  // Domain-based: admin.domain.com → admin
  if (hostname.startsWith("admin.")) return "admin";

  // Path-based fallback: /dashboard/* or /auth/* → admin
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) return "admin";

  return "customer";
}
