import { useState, useEffect, useRef } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/shared/api/services";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/AuthContext";

import { type AdminVerifyOtpInput } from "@/shared/schemas/admin-auth";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Prefer the explicit location state (sign-in -> verify-otp handoff) but
  // fall back to sessionStorage so a page refresh still works.
  const stateSessionId = (location.state as { session_id?: string } | null)?.session_id;
  const sessionId =
    stateSessionId || sessionStorage.getItem("admin_otp_session_id") || undefined;
  const navState = (location.state as { email?: string; password?: string } | null) || {};
  const email = navState.email;
  // Password is only available in the same navigation handoff (i.e. not after
  // a page refresh), so resend only works when the user came straight from
  // sign-in. After a refresh they must go back to /auth/sign-in.
  const password = navState.password;
  const loginAdmin = useAuth().loginAdmin;
  const access = useAuth().access;

  const [formData, setFormData] = useState<AdminVerifyOtpInput>({ otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const otpValue = formData.otp;

  useEffect(() => {
    if (!sessionId) navigate("/auth/sign-in");
  }, [sessionId, navigate]);

  useEffect(() => {
    if (access) navigate("/dashboard");
  }, [access, navigate]);

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionId) {
      showError("Session expired. Please sign in again.");
      navigate("/auth/sign-in");
      return;
    }
    const data = formData;

    setLoading(true);
    setError("");
    try {
      const res = await authService.admin.verifyOtp({
        session_id: sessionId,
        otp: data.otp,
      });
      const responseData: any = res.data;
      const accessToken =
        responseData.access || responseData.data?.access || responseData.token;
      const refreshToken =
        responseData.refresh ||
        responseData.data?.refresh ||
        responseData.refresh_token ||
        "";
      const adminData =
        responseData.admin || responseData.data?.admin || responseData.user || {};

      if (!accessToken) {
        throw new Error("Invalid response from server: Missing access token.");
      }

      loginAdmin({
        data: {
          access: accessToken,
          refresh: refreshToken,
          admin: adminData,
        },
      });
      sessionStorage.removeItem("admin_otp_session_id");
      toast.success("Login successful!");
      // Navigation is handled by the useEffect on 'access' change to prevent context race condition
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData({ ...formData, otp: value });
    if (value.length === 6) {
      // Auto-submit when 6 digits entered
      setTimeout(() => handleVerify(), 0);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    if (!email || !password) {
      // After a page refresh we no longer have the original password, so
      // resend is impossible — bounce back to sign-in.
      showError("Please sign in again to resend the OTP.");
      navigate("/auth/sign-in");
      return;
    }
    setIsResending(true);
    try {
      const response = await authService.admin.login({ email, password });
      const loginData: any = response.data;
      if (loginData?.session_id) {
        sessionStorage.setItem("admin_otp_session_id", loginData.session_id);
        toast.success("OTP resent to your email.");
        setResendTimer(60);
        setFormData({ otp: "" });
      } else {
        // Edge case: the backend returned tokens instead of a new session —
        // log the admin in directly.
        const accessToken =
          loginData?.access || loginData?.data?.access || loginData?.token;
        if (accessToken) {
          loginAdmin({
            data: {
              access: accessToken,
              refresh:
                loginData?.refresh ||
                loginData?.data?.refresh ||
                loginData?.refresh_token ||
                "",
              admin:
                loginData?.admin ||
                loginData?.data?.admin ||
                loginData?.user ||
                {},
            },
          });
        }
      }
    } catch {
      toast.error("Failed to resend OTP. Please sign in again.");
      navigate("/auth/sign-in");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row min-h-screen">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
          <p className="text-lg text-muted-foreground">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>
        <Card className="w-full max-w-md p-8 shadow-lg relative rounded-2xl">
          {(loading || isResending) && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-2xl">
              <div className="w-10 h-10 animate-spin rounded-full border-4 border-t-blue-600" />
            </div>
          )}
          <form className="flex flex-col gap-6" onSubmit={handleVerify}>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpValue}
                onChange={handleOtpChange}
                required
                autoFocus
                className="text-center text-2xl tracking-[0.4em] font-semibold"
              />
            </div>
            <Button type="submit" className="mt-4 w-full" disabled={loading || otpValue.length < 6}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                You can resend OTP in{" "}
                <span className="font-semibold text-admin-accent">{resendTimer}s</span>
              </p>
            ) : (
              <p
                className="text-sm text-muted-foreground cursor-pointer hover:text-admin-accent"
                onClick={handleResend}
              >
                Didn't receive OTP? <span className="text-admin-accent font-medium">Resend</span>
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default VerifyOtp;
