import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { setupInterceptors } from "@/shared/api/client";
import { getAppMode } from "@/shared/utils/routing";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = "admin" | "customer";

export interface CustomerUser {
  id?: number;
  email?: string;
  full_name?: string;
  phone?: string;
  login_method?: string;
  customer_details?: {
    id: number;
    full_name?: string;
    profile_image?: string;
    google_profile_image?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface AdminLoginData {
  data: {
    access: string;
    refresh: string;
    admin: Record<string, any>;
  }
}

interface CustomerLoginData {
  access: string;
  refresh: string;
  user: CustomerUser;
}

export interface AuthContextType {
  role: Role | null;
  access: string | null;
  refresh: string | null;
  admin: Record<string, any> | null;
  user: CustomerUser | null;

  loginAdmin: (data: AdminLoginData) => void;
  loginCustomer: (data: CustomerLoginData) => void;
  logout: () => void;
  setUser: (user: CustomerUser | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

const clearExpiryTimer = () => {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
};

const watchRefreshExpiry = (refreshToken: string, logoutFn: () => void) => {
  clearExpiryTimer();
  try {
    const { exp } = jwtDecode<{ exp: number }>(refreshToken);
    const timeout = exp * 1000 - Date.now();
    if (timeout > 0) {
      expiryTimer = setTimeout(() => {
        toast.error("Session expired, please log in again.");
        logoutFn();
      }, timeout);
    }
  } catch {
    // invalid token — ignore
  }
};

const persist = (
  role: Role | null,
  access: string | null,
  refresh: string | null,
  profile: Record<string, unknown> | null
) => {
  if (access) localStorage.setItem("access", access);
  else localStorage.removeItem("access");

  if (refresh) localStorage.setItem("refresh", refresh);
  else localStorage.removeItem("refresh");

  if (role === "admin" && profile) {
    localStorage.setItem("admin", JSON.stringify(profile));
    localStorage.removeItem("user");
  } else if (role === "customer" && profile) {
    localStorage.setItem("user", JSON.stringify(profile));
    localStorage.removeItem("admin");
  } else {
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
  }
};

const rehydrate = (): Pick<AuthContextType, "role" | "access" | "refresh" | "admin" | "user"> => {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");
  const adminRaw = localStorage.getItem("admin");
  const userRaw = localStorage.getItem("user");

  if (adminRaw && access) {
    let admin: Record<string, unknown> = {};
    try { admin = JSON.parse(adminRaw); } catch { admin = {}; }
    return { role: "admin", access, refresh, admin, user: null };
  }
  if (userRaw && access) {
    let user: CustomerUser = {};
    try { user = JSON.parse(userRaw); } catch { user = {}; }
    return { role: "customer", access, refresh, admin: null, user };
  }
  return { role: null, access: null, refresh: null, admin: null, user: null };
};

// ─── Context & Provider ──────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState(() => rehydrate());

  const logout = () => {
    clearExpiryTimer();
    localStorage.clear();
    setAuthState({ role: null, access: null, refresh: null, admin: null, user: null });
  };

  useEffect(() => {
    const loginPath = getAppMode() === "admin" ? "/auth/sign-in" : "/login";
    setupInterceptors(logout, { loginPath });

    if (authState.refresh && authState.role === "customer") {
      watchRefreshExpiry(authState.refresh, logout);
    }
  }, []);

  const loginAdmin = (data: AdminLoginData) => {
    persist("admin", data.data.access, data.data.refresh, data.data.admin);
    setAuthState({
      role: "admin",
      access: data.data.access,
      refresh: data.data.refresh,
      admin: data.data.admin,
      user: null,
    });
    setupInterceptors(logout, { loginPath: "/auth/sign-in" });
  };

  const loginCustomer = (data: CustomerLoginData) => {
    persist("customer", data.access, data.refresh, data.user);
    setAuthState({
      role: "customer",
      access: data.access,
      refresh: data.refresh,
      admin: null,
      user: data.user,
    });
    setupInterceptors(logout, { loginPath: "/login" });
    watchRefreshExpiry(data.refresh, logout);
  };

  const setUser = (user: CustomerUser | null) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginAdmin, loginCustomer, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
