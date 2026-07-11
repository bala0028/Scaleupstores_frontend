import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authService } from "@/shared/api/services";
import { useAuth, type CustomerUser } from "@/shared/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { type VerificationInput } from "@/shared/schemas/auth";

type FlowType = "email" | "phone_register" | "phone_login";

const Verification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const loginCustomer = useAuth().loginCustomer;

  const { type } = (location.state as { type?: FlowType }) || {};
  const sessionId = sessionStorage.getItem("otp_session_id");

  useEffect(() => {
    if (!type || !sessionId) {
      toast.error("Session expired, please start again.");
      // Route to the right starting page based on flow type
      const target =
        type === "phone_login" ? "/phone-login" : "/register";
      navigate(target);
    }
  }, [type, sessionId, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const handleChange = (value: string, index: number) => {
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

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      if (type === "email") {
        const password = sessionStorage.getItem("otp_password");
        if (!password) {
          showError("Password not found. Please register again.");
          navigate("/register");
          return;
        }
        const res = await authService.customer.verifyEmail({
          session_id: sessionId,
          otp: otp.join(""),
          password,
        });
        const data: any = res.data?.data;
        if (data?.access) {
          loginCustomer({
            access: data.access,
            refresh: data.refresh,
            user: (data.user || {}) as CustomerUser,
          });
          // Clean up the temporary sessionStorage entries.
          sessionStorage.removeItem("otp_session_id");
          sessionStorage.removeItem("otp_email");
          sessionStorage.removeItem("otp_password");
          toast.success("🎉 OTP Verified! Welcome 🚀");
          navigate("/");
        } else {
          showError("Invalid OTP, please try again.");
        }
      } else if (type === "phone_register") {
        const res = await authService.customer.verifyPhoneRegister({
          session_id: sessionId,
          otp: otp.join(""),
        });
        const data: any = res.data?.data;
        if (data?.access) {
          loginCustomer({
            access: data.access,
            refresh: data.refresh,
            user: (data.user || {}) as CustomerUser,
          });
          sessionStorage.removeItem("otp_session_id");
          sessionStorage.removeItem("otp_phone");
          toast.success("🎉 Phone verified! Welcome 🚀");
          navigate("/");
        } else {
          showError("Invalid OTP, please try again.");
        }
      } else if (type === "phone_login") {
        const res = await authService.customer.verifyPhoneLogin({
          session_id: sessionId,
          otp: otp.join(""),
        });
        const data: any = res.data?.data;
        if (data?.access) {
          loginCustomer({
            access: data.access,
            refresh: data.refresh,
            user: (data.user || {}) as CustomerUser,
          });
          sessionStorage.removeItem("otp_session_id");
          sessionStorage.removeItem("otp_phone");
          toast.success("Logged in successfully!");
          navigate("/");
        } else {
          showError("Invalid OTP, please try again.");
        }
      } else {
        showError("Unknown verification flow. Please start again.");
      }
    } catch (err: any) {
      const d = err.response?.data;
      showError(
        d?.error ||
          d?.errors?.non_field_errors?.[0] ||
          d?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setOtp(new Array(6).fill(""));
    try {
      let message = "OTP resent successfully";
      if (type === "email") {
        const email = sessionStorage.getItem("otp_email") || "";
        if (!email) {
          showError("Email not found. Please register again.");
          navigate("/register");
          return;
        }
        const res = await authService.customer.registerEmail({ email });
        sessionStorage.setItem("otp_session_id", res.data.data.session_id);
        message = res.data.message || message;
      } else if (type === "phone_register") {
        const phone = sessionStorage.getItem("otp_phone") || "";
        if (!phone) {
          showError("Phone not found. Please register again.");
          navigate("/register");
          return;
        }
        const res = await authService.customer.phoneRegister({ phone });
        sessionStorage.setItem("otp_session_id", res.data.data.session_id);
        message = res.data.message || message;
      } else if (type === "phone_login") {
        const phone = sessionStorage.getItem("otp_phone") || "";
        if (!phone) {
          showError("Phone not found. Please log in again.");
          navigate("/phone-login");
          return;
        }
        const res = await authService.customer.phoneLogin({ phone });
        sessionStorage.setItem("otp_session_id", res.data.data.session_id);
        message = res.data.message || message;
      }
      toast.success(message);
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "Failed to resend OTP");
    }
  };

  const headerText =
    type === "email"
      ? "Email"
      : type === "phone_register"
      ? "Phone (Register)"
      : type === "phone_login"
      ? "Phone (Login)"
      : "Phone";

  const destinationText =
    type === "email" ? "email address" : "phone number";

  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-cream p-5">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] bg-white rounded-2xl p-10 text-center shadow-[0_10px_25px_rgba(25,135,84,0.2)] max-md:px-[22px] max-md:py-[35px]"
      >
        <h4 className="text-3xl mb-[15px] font-bold text-black max-md:text-2xl">
          OTP Verification ({headerText})
        </h4>
        <p className="text-base text-black opacity-80 mb-[30px] leading-[1.5]">
          Enter the 6-digit OTP we sent to your {destinationText}.<br />
          Didn't receive it? You can resend after <strong>{resendTimer}s</strong>.
        </p>

        <form onSubmit={onSubmit}>
          <div className="flex justify-center gap-[10px] flex-nowrap mb-5 max-sm:gap-2">
            {otp.map((digit, i) => (
              <Input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="flex-1 min-w-[45px] max-w-[55px] h-[65px] rounded-2xl border-[1.5px] border-brand-border-light bg-brand-cream text-brand font-extrabold text-3xl text-center transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_12px_rgba(112,168,77,0.8)] max-sm:min-w-[40px] max-sm:max-w-[45px] max-sm:h-[55px] max-sm:text-2xl max-[400px]:min-w-[36px] max-[400px]:max-w-[40px] max-[400px]:h-[50px] max-[400px]:text-xl"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
              />
            ))}
          </div>
          {error && <p className="text-destructive text-center text-sm mb-3">{error}</p>}
          <Button
            variant="brand"
            type="submit"
            className="rounded-pill py-[14px] font-bold text-xl w-full max-md:text-base max-md:py-3"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Submit OTP"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="font-semibold text-base text-brand mt-3"
          disabled={resendTimer > 0}
          onClick={handleResendOtp}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </Button>
      </motion.div>
    </div>
  );
};

export default Verification;
