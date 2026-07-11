import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FaPhone, FaArrowLeft } from "react-icons/fa";
import { authService } from "@/shared/api/services";
import { useAuth, type CustomerUser } from "@/shared/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/shared/utils/phone";

type Step = "enter-phone" | "enter-otp";

const PhoneLogin = () => {
  const [step, setStep] = useState<Step>("enter-phone");
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const loginCustomer = useAuth().loginCustomer;
  const access = useAuth().access;

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  // Auto-redirect when already logged in
  useEffect(() => {
    if (access) navigate("/");
  }, [access, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Restore session from navigation state (e.g. login button)
  useEffect(() => {
    const state = location.state as { sessionId?: string; phone?: string } | null;
    if (state?.sessionId && state?.phone) {
      setSessionId(state.sessionId);
      setPhone(state.phone);
      setStep("enter-otp");
    }
  }, [location.state]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      showError("Please enter a valid phone number with country code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.customer.phoneLogin({ phone: normalized });
      const body: any = res.data;
      setSessionId(body.data.session_id);
      setPhone(normalized);
      setStep("enter-otp");
      setResendTimer(60);
      setOtp(new Array(6).fill(""));
      toast.success(body.message || "OTP sent to your phone");
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const res = await authService.customer.verifyPhoneLogin({
        session_id: sessionId,
        otp: otp.join(""),
      });
      const data = (res.data as any)?.data;
      if (data?.access) {
        loginCustomer({
          access: data.access,
          refresh: data.refresh,
          user: (data.user || {}) as CustomerUser,
        });
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        showError("Invalid OTP, please try again.");
      }
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    setLoading(true);
    setError("");
    try {
      const res = await authService.customer.phoneLogin({ phone });
      const body: any = res.data;
      setSessionId(body.data.session_id);
      setResendTimer(60);
      setOtp(new Array(6).fill(""));
      toast.success(body.message || "OTP resent");
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "enter-otp") {
      setStep("enter-phone");
      setOtp(new Array(6).fill(""));
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-cream p-5">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] bg-white rounded-2xl p-10 text-center shadow-[0_10px_25px_rgba(25,135,84,0.2)] max-md:px-[22px] max-md:py-[35px]"
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand mb-4 self-start"
        >
          <FaArrowLeft /> Back
        </button>

        <h4 className="text-3xl mb-[15px] font-bold text-black max-md:text-2xl">
          {step === "enter-phone" ? "Login with Phone" : "Verify OTP"}
        </h4>
        <p className="text-base text-black opacity-80 mb-[30px] leading-[1.5]">
          {step === "enter-phone"
            ? "Enter your phone number and we'll send you a 6-digit OTP."
            : <>Enter the 6-digit code we sent to <strong>{phone}</strong>.<br />Didn't receive it? You can resend after <strong>{resendTimer}s</strong>.</>}
        </p>

        {step === "enter-phone" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-[22px]">
            <div className="relative">
              <Input
                type="tel"
                placeholder=" "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
              />
              <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
                <FaPhone /> Phone (+country code)
              </label>
            </div>
            {error && <p className="text-destructive text-center -mt-[10px] text-base">{error}</p>}
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            <p className="text-sm text-muted-foreground -mt-2">
              Prefer email?{" "}
              <Link to="/login" className="text-brand font-bold underline">
                Login with email
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex justify-center gap-[10px] flex-nowrap">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="flex-1 min-w-[45px] max-w-[55px] h-[65px] rounded-2xl border-[1.5px] border-brand-border-light bg-brand-cream text-brand font-extrabold text-3xl text-center transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_12px_rgba(112,168,77,0.8)] max-sm:min-w-[40px] max-sm:max-w-[45px] max-sm:h-[55px] max-sm:text-2xl"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                />
              ))}
            </div>
            {error && <p className="text-destructive text-center text-base">{error}</p>}
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl w-full max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="font-semibold text-base text-brand"
              disabled={resendTimer > 0 || loading}
              onClick={handleResend}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default PhoneLogin;
