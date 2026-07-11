import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { authService } from "@/shared/api/services";
import { useAuth, type CustomerUser } from "@/shared/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LoginInput } from "@/shared/schemas/auth";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
}

export function LoginModal({ show, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const loginCustomer = useAuth().loginCustomer;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginInput>({ email: "", password: "" });

  const showError = (msg: string) => {
    setServerError(msg);
    setTimeout(() => setServerError(""), 3000);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.customer.login({ email: formData.email, password: formData.password });
      const responseData = res.data as any;
      const access_token = responseData.access || responseData.data?.access || responseData.token;
      const refresh_token = responseData.refresh || responseData.data?.refresh || responseData.refresh_token || "";
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
      onClose();
      navigate("/");
      setFormData({ email: "", password: "" });
    } catch (error: any) {
      showError(error.response?.data?.error || "Invalid email or password");
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
      onClose();
      window.location.href = "/";
    } catch (error: any) {
      showError(error.response?.data?.error || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-[90%] max-w-[420px] bg-white rounded-2xl p-10 text-center shadow-[0_10px_25px_rgba(25,135,84,0.2)] max-md:px-[22px] max-md:py-[35px]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 focus:outline-none"
            >
              ✕
            </button>
            <h5 className="text-3xl mb-[25px] font-bold text-black max-md:text-2xl">Welcome Back!</h5>

            <form onSubmit={handleEmailLogin} className="flex flex-col gap-[22px]">
              <div className="relative">
                <FaEnvelope className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-[50px] pl-[45px] pr-[15px] border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-[var(--color-brand)] bg-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full h-[50px] pl-[45px] pr-[45px] border-gray-300 rounded-lg text-[15px] focus:ring-2 focus:ring-[var(--color-brand)] bg-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-[15px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" onClick={onClose} className="text-sm font-semibold text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>

              {serverError && <div className="text-red-500 text-sm mb-2">{serverError}</div>}

              <Button
                type="submit"
                className="w-full h-[50px] bg-brand hover:bg-brand-action text-white text-[15px] font-bold rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Login"}
              </Button>

              <div className="text-center -mt-1">
                <Link
                  to="/phone-login"
                  onClick={onClose}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Login with Phone (OTP)
                </Link>
              </div>

              <div className="flex items-center text-gray-500 my-2">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-[15px] text-sm">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] border-gray-300 text-black font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <FcGoogle className="text-xl" /> Continue with Google
              </Button>

              <div className="mt-2">
                <span className="text-sm font-semibold text-gray-600">Don't have an account? </span>
                <Link to="/register" onClick={onClose} className="text-sm font-semibold text-brand hover:underline">
                  Register
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
