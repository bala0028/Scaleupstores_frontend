import { Suspense, Component, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidenav, DashboardNavbar, Configurator } from "@/admin/components/widgets/layout";
import routes from "@/admin/routes";
import { useAdminUI } from "@/admin/context";
import { useAuth } from "@/shared/contexts/AuthContext";

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="max-w-xl bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
            <pre className="text-sm text-red-800 whitespace-pre-wrap bg-red-50 p-4 rounded-lg">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Dashboard() {
  const role = useAuth().role;
  const [controller] = useAdminUI();
  const { sidenavType, sidenavCollapsed } = controller;

  if (role !== "admin") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-admin-page-bg">
        <Sidenav
          routes={routes}
          brandImg="/Logo.png"
        />
        <div className={`px-4 py-4 transition-[margin] duration-300 ${sidenavCollapsed ? "xl:ml-[116px]" : "xl:ml-[300px]"}`}>
          <div className="mb-2">
            <DashboardNavbar />
          </div>
          <Suspense
            fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading...</div>}
          >
            <Routes>
              {routes
                .filter((r) => r.layout === "dashboard")
                .flatMap(({ pages }) =>
                  pages.flatMap(({ path, element, subRoutes }) =>
                    subRoutes
                      ? subRoutes.map((sub) => (
                          <Route key={sub.path} path={sub.path} element={sub.element} />
                        ))
                      : [<Route key={path} path={path} element={element} />]
                  )
                )}
              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </Suspense>
        </div>
        <Configurator />
      </div>
    </DashboardErrorBoundary>
  );
}

Dashboard.displayName = "/src/layouts/dashboard.jsx";
export default Dashboard;
