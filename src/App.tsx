import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getAppMode } from "@/shared/utils";
import { DevPanel } from "@/shared/components/DevPanel";

const mode = getAppMode();

// Lazy load only the needed app
const AdminApp = lazy(() => import("@/admin/AdminApp"));
const CustomerRoutes = lazy(() => import("@/customer/routes"));

const Loading = () => (
  <div
    style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}
  >
    Loading...
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        {mode === "admin" ? (
          <div data-theme="admin">
            <AdminApp />
          </div>
        ) : (
          <Routes>
            <Route
              path="/*"
              element={
                <div className="customer-app" data-theme="customer">
                  <CustomerRoutes />
                </div>
              }
            />
          </Routes>
        )}
      </Suspense>
      {import.meta.env.DEV && <DevPanel />}
    </>
  );
}

export default App;
