import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { AdminUIProvider } from "@/admin/context";
import { adminMuiTheme } from "@/admin/theme/muiTheme";
import Dashboard from "@/admin/layouts/dashboard";
import Auth from "@/admin/layouts/auth";

const DashboardTool = lazy(() => import("@/admin/pages/dashboard/DashboardTool"));
const DashboardCustomization = lazy(() => import("@/admin/pages/dashboard/DashboardCustomization"));

export default function AdminApp() {
  return (
    <ThemeProvider theme={adminMuiTheme}>
      <AdminUIProvider>
        <Routes>
          {/* Standalone — no sidebar/navbar chrome, reachable only by direct URL. */}
          <Route path="/dashboard/tool" element={<DashboardTool />} />
          <Route path="/dashboard/customization" element={<DashboardCustomization />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
        </Routes>
      </AdminUIProvider>
    </ThemeProvider>
  );
}
