import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { authService } from "@/shared/api/services";

import { type AdminLoginInput } from "@/shared/schemas/admin-auth";

export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdminLoginInput>({ email: "", password: "" });

  const navigate = useNavigate();
  const access = useAuth().access;
  const loginAdmin = useAuth().loginAdmin;

  useEffect(() => {
    if (access) navigate("/dashboard");
  }, [access, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await authService.admin.login({
        email: data.email,
        password: data.password,
      });

      const responseData = res.data as any;

      const access_token = responseData.access || responseData.data?.access || responseData.token;
      const session_id = responseData.session_id || responseData.data?.session_id;
      const refresh_token = responseData.refresh || responseData.data?.refresh || responseData.refresh_token || "";
      const adminData = responseData.admin || responseData.data?.admin || responseData.user || responseData.data?.user || {};

      // Two-step admin login: the response contains a session_id (and an OTP
      // was just emailed) — NOT an access token. The access token only comes
      // back after /verifyloginotp/ is called with the correct OTP.
      if (session_id) {
        sessionStorage.setItem("admin_otp_session_id", session_id);
        navigate("/auth/verify-otp", {
          state: { session_id, email: data.email, password: data.password },
        });
        return;
      }

      if (!access_token) {
        throw new Error("Invalid response from server: Missing access token.");
      }

      loginAdmin({
        data: {
          access: access_token,
          refresh: refresh_token,
          admin: adminData,
        },
      });

      // Navigation is handled safely by the useEffect watching 'access' context to prevent React Router race conditions.
      return;
    } catch (err: unknown) {
      setError(
        (err instanceof Error ? err.message : null) ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full bg-white">
      {/* ── Decorative side (desktop only, full height) ── */}
      <div className="sticky top-0 hidden h-screen w-1/2 lg:block p-3">
        <img
          src="/assets/LoginLeft.jpg"
          alt=""
          className="h-full w-full object-cover rounded-lg"
        />
      </div>

      {/* ── Form side — sits directly on the page, no card wrapper ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 sm:px-10 lg:px-16">
        {/* subtle ambient backdrop so the form doesn't sit on flat white */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-admin-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-admin-secondary/15 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-accent to-admin-secondary text-white shadow-lg shadow-admin-accent/30">
            <Sparkles className="h-5.5 w-5.5" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to access your admin dashboard</p>

          <form className="mt-9 flex flex-col gap-5" onSubmit={handleLogin}>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="admin-login" className="mb-1.5 block text-xs font-medium text-gray-600">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-login"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-admin-accent focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-gray-600">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-admin-accent focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-gray-600">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-admin-accent"
                />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="font-medium text-admin-accent hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full bg-gradient-to-r from-admin-accent to-admin-secondary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-admin-accent/30 transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
