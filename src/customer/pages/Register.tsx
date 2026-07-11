import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { authService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/shared/utils/phone";

import { type RegisterInput } from "@/shared/schemas/auth";

const Register = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState("");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const loginCustomer = useAuth().loginCustomer;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterInput>({} as RegisterInput);

  const showError = (msg: string) => {
    setErrors(msg);
    setTimeout(() => setErrors(""), 4000);
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    if (!data.email || !data.password) {
      showError("Email and password are required");
      return;
    }
    if (data.password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Step 1: send OTP. Password is NOT sent here — it will be set in step 2.
      const res = await authService.customer.registerEmail({ email: data.email });
      const body: any = res.data;
      toast.success(body.message || "OTP sent to email");
      // Only persist the data step 2 needs. Never store the plaintext password.
      sessionStorage.setItem("otp_session_id", body.data.session_id);
      sessionStorage.setItem("otp_email", data.email);
      sessionStorage.setItem("otp_password", data.password); // needed by step 2 to set the password
      navigate("/verification", { state: { type: "email" } });
    } catch (error: any) {
      const d = error.response?.data;
      const errorValues = typeof d === "object" && d ? Object.values(d) : [];
      showError(
        d?.error ||
          d?.message ||
          (errorValues.length > 0 && Array.isArray(errorValues[0])
            ? errorValues[0][0]
            : errorValues[0]) ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      showError("Please enter a valid phone number with country code");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.customer.phoneRegister({ phone: normalized });
      const body: any = res.data;
      toast.success(body.message || "OTP sent to phone");
      sessionStorage.setItem("otp_session_id", body.data.session_id);
      sessionStorage.setItem("otp_phone", normalized);
      navigate("/verification", { state: { type: "phone_register" } });
    } catch (error: any) {
      const d = error.response?.data;
      const errorValues = typeof d === "object" && d ? Object.values(d) : [];
      showError(
        d?.error ||
          d?.message ||
          (errorValues.length > 0 && Array.isArray(errorValues[0])
            ? errorValues[0][0]
            : errorValues[0]) ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authService.customer.google({ token: idToken });
      const body: any = res.data;
      loginCustomer({
        access: body.data.access,
        refresh: body.data.refresh,
        user: body.data.user || {},
      });
      toast.success("Google login successful!");
      navigate("/");
    } catch (error: any) {
      showError(error.response?.data?.error || error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-cream p-5">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[420px] bg-white rounded-2xl p-10 text-center shadow-[0_10px_25px_rgba(25,135,84,0.2)] max-md:px-[22px] max-md:py-[35px]"
      >
        <h4 className="text-3xl mb-[25px] font-bold text-black max-md:text-2xl">
          Create Your Account
        </h4>

        <div className="flex justify-center gap-5 mb-[30px]">
          <motion.button
            type="button"
            aria-label="Register with email"
            className={`w-[54px] h-[54px] rounded-full border-2 border-brand ${
              method === "email" ? "bg-brand text-white" : "bg-brand-cream text-brand"
            } cursor-pointer flex justify-center items-center text-2xl transition-all max-md:w-[50px] max-md:h-[50px] max-md:text-[22px]`}
            onClick={() => setMethod("email")}
            whileTap={{ scale: 0.95 }}
          >
            <FaEnvelope size={24} />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Register with phone"
            className={`w-[54px] h-[54px] rounded-full border-2 border-brand ${
              method === "phone" ? "bg-brand text-white" : "bg-brand-cream text-brand"
            } cursor-pointer flex justify-center items-center text-2xl transition-all max-md:w-[50px] max-md:h-[50px] max-md:text-[22px]`}
            onClick={() => setMethod("phone")}
            whileTap={{ scale: 0.95 }}
          >
            <FaPhone size={22} />
          </motion.button>
        </div>

        {method === "email" ? (
          <motion.form onSubmit={handleEmailRegister} className="flex flex-col gap-[22px]">
            <div className="relative">
              <Input
                type="email"
                placeholder=" "
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
              />
              <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
                <FaEnvelope /> Email
              </label>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                required
                minLength={6}
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
              />
              <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
                <FaLock /> Password
              </label>
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 border-none bg-transparent text-black cursor-pointer text-xl"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors && (
              <p className="text-destructive text-center -mt-[10px] text-base">{errors}</p>
            )}
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Register"}
            </Button>
          </motion.form>
        ) : (
          <motion.form onSubmit={handlePhoneRegister} className="flex flex-col gap-[22px]">
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
            {errors && (
              <p className="text-destructive text-center -mt-[10px] text-base">{errors}</p>
            )}
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            <p className="text-xs text-muted-foreground -mt-2">
              Example: +91 98765 43210 or +1 555 123 4567
            </p>
          </motion.form>
        )}

        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          className="mt-[30px] flex items-center justify-center gap-4 py-3 rounded-pill border-2 border-brand bg-transparent text-brand font-bold w-full transition-all hover:bg-brand hover:text-white max-md:text-base max-md:py-3"
          disabled={loading}
        >
          <FcGoogle size={24} /> Login with Google
        </Button>

        <p className="mt-[35px] text-black font-semibold">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand font-bold underline transition-colors hover:text-brand-action"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
