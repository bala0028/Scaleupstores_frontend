import { useState } from "react";
import { FloatingInput } from "@/shared/components/FloatingInput";
import { Link } from "react-router-dom";
import { authService } from "@/shared/api/services";

import {
  type AdminForgotPasswordInput,
} from "@/shared/schemas/admin-auth";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AdminForgotPasswordInput>({ email: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    setLoading(true);
    setError("");
    try {
      const { data: res } = await authService.admin.forgotPassword(data.email);
      if (res && typeof res === "object" && "status" in res && res.status) {
        setSuccess(true);
      } else {
        setError(
          (res && typeof res === "object" && "message" in res && typeof res.message === "string"
            ? res.message
            : null) || "Something went wrong"
        );
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white p-8 shadow-lg">
          <h4 className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground">
            Forgot Password 🔒
          </h4>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Enter your email and we'll send you reset instructions.
          </p>

          {success ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-success">
              Please check your email for reset instructions.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                  error={!!error}
                />
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-xl bg-gray-900 px-4 py-3
                  text-sm font-semibold uppercase tracking-widest text-white
                  transition-colors duration-200
                  hover:bg-black
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/sign-in" className="font-semibold hover:underline text-foreground">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
