import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { toastConfig } from "@/shared/components/toast-config";
import { applyTheme } from "@/shared/config/themeLoader";
import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "@/shared/contexts/AuthContext";

applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    <Toaster position="top-right" duration={3000} gap={8} offset={20} toastOptions={toastConfig} />
  </StrictMode>
);
