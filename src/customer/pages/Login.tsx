import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth, type CustomerUser } from "@/shared/stores";
import { authService } from "@/shared/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/shared/utils/phone";

import { type LoginInput } from "@/shared/schemas/auth";

const Login = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [phone, setPhone] = useState("");
  const loginCustomer = useAuth().loginCustomer;
  const access = useAuth().access;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginInput>({ email: "", password: "" });

  const showError = (msg: string) => {
    setServerError(msg);
    setTimeout(() => setServerError(""), 4000);
  };

  useEffect(() => {
    const msg = sessionStorage.getItem("redirect_toast");
    if (msg) {
      toast.success(msg, { duration: 3000 });
      sessionStorage.removeItem("redirect_toast");
    }
  }, []);

  useEffect(() => {
    if (access) navigate("/");
  }, [access, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.customer.login({
        email: formData.email,
        password: formData.password,
      });
      const responseData: any = res.data;
      const access_token = responseData.access || responseData.data?.access || responseData.token;
      const refresh_token =
        responseData.refresh || responseData.data?.refresh || responseData.refresh_token || "";
      const userData = responseData.user || responseData.data?.user || {};

      if (!access_token) {
        throw new Error("Invalid response from server: Missing access token.");
      }

      loginCustomer({
        access: access_token,
        refresh: refresh_token,
        user: userData as CustomerUser,
      });
      toast.success("Logged in successfully!");
      // Navigation handled by useEffect on 'access' change
    } catch (error: any) {
      showError(error.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      showError("Please enter a valid phone number with country code");
      return;
    }
    setLoading(true);
    try {
      // Step 1: send the OTP. We then hand off to the existing /phone-login
      // page which performs step 2 (verify).
      const res = await authService.customer.phoneLogin({ phone: normalized });
      const body: any = res.data;
      toast.success(body.message || "OTP sent to your phone");
      sessionStorage.setItem("otp_session_id", body.data.session_id);
      sessionStorage.setItem("otp_phone", normalized);
      navigate("/phone-login", { state: { sessionId: body.data.session_id, phone: normalized } });
    } catch (err: any) {
      const d = err.response?.data;
      showError(d?.message || d?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authService.customer.google({ token: idToken });
      const body: any = res.data;
      loginCustomer({
        access: body.data.access,
        refresh: body.data.refresh,
        user: body.data.user as CustomerUser,
      });
      toast.success("Logged in with Google!");
      // Navigation handled by useEffect on 'access' change
    } catch (error: any) {
      showError(error.response?.data?.error || "Google login failed");
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
        <h5 className="text-3xl mb-[25px] font-bold text-black max-md:text-2xl">
          Welcome Back!
        </h5>

        {/* Method toggle */}
        <div className="flex justify-center gap-5 mb-[25px]">
          <motion.button
            type="button"
            aria-label="Login with email"
            className={`w-[54px] h-[54px] rounded-full border-2 border-brand ${
              method === "email" ? "bg-brand text-white" : "bg-brand-cream text-brand"
            } cursor-pointer flex justify-center items-center text-2xl transition-all`}
            onClick={() => setMethod("email")}
            whileTap={{ scale: 0.95 }}
          >
            <FaEnvelope size={24} />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Login with phone"
            className={`w-[54px] h-[54px] rounded-full border-2 border-brand ${
              method === "phone" ? "bg-brand text-white" : "bg-brand-cream text-brand"
            } cursor-pointer flex justify-center items-center text-2xl transition-all`}
            onClick={() => setMethod("phone")}
            whileTap={{ scale: 0.95 }}
          >
            <FaPhone size={22} />
          </motion.button>
        </div>

        {method === "email" ? (
          <motion.form onSubmit={handleEmailLogin} className="flex flex-col gap-[22px]">
            <div className="relative">
              <Input
                type="email"
                placeholder=" "
                required
                value={formData.email}
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
                value={formData.password}
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
            {serverError && (
              <p className="text-destructive text-center -mt-[10px] text-base">{serverError}</p>
            )}
            <div className="text-right -mt-[15px]">
              <Link to="/password-reset" className="text-brand font-semibold underline text-base">
                Forgot Password?
              </Link>
            </div>
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </motion.form>
        ) : (
          <motion.form onSubmit={handlePhoneLogin} className="flex flex-col gap-[22px]">
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
            {serverError && (
              <p className="text-destructive text-center -mt-[10px] text-base">{serverError}</p>
            )}
            <Button
              variant="brand"
              type="submit"
              className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <p className="text-xs text-muted-foreground -mt-2">
              Example: +91 98765 43210 or +1 555 123 4567
            </p>
          </motion.form>
        )}

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          className="mt-[30px] flex items-center justify-center gap-4 py-3 rounded-pill border-2 border-brand bg-transparent text-brand font-bold w-full transition-all hover:bg-brand hover:text-white max-md:text-base max-md:py-3"
          disabled={loading}
        >
          <FcGoogle size={24} /> {loading ? "Please wait..." : "Login with Google"}
        </Button>

        <p className="mt-[35px] text-black font-semibold">
          New here?{" "}
          <Link
            to="/register"
            className="text-brand font-bold underline transition-colors hover:text-brand-action"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
