import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { toast } from "sonner";

interface InterceptorOptions {
  loginPath?: string;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Wire up response interceptors with a logout callback.
 * Call once from each app's AuthContext on mount.
 * Safe to re-call — ejects previous interceptor first.
 */
let responseInterceptorId: number | null = null;

export const setupInterceptors = (
  logout: () => void,
  { loginPath: _loginPath = "/login" }: InterceptorOptions = {}
): void => {
  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      if (!originalRequest) return Promise.reject(error);

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refresh = localStorage.getItem("refresh");

        if (refresh) {
          try {
            const { data } = await axios.post<{ data: { access: string; refresh?: string } }>(
              `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
              { refresh }
            );
            const newAccess = data.data.access;
            localStorage.setItem("access", newAccess);
            if (data.data.refresh) localStorage.setItem("refresh", data.data.refresh);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          } catch {
            // Refresh failed — fall through to logout
          }
        }

        toast.dismiss();
        toast.error("Session expired. Please log in again.");
        logout();
      }

      return Promise.reject(error);
    }
  );
};

export default api;
