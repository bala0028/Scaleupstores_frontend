import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Footer } from "@/admin/components/widgets/layout";
import routes from "@/admin/routes";

export function Auth() {
  return (
    <div className="relative min-h-screen w-full">
      <Suspense
        fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading...</div>}
      >
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "auth" &&
              pages.map(({ path, element }) => <Route key={path} path={path} element={element} />)
          )}
          <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
