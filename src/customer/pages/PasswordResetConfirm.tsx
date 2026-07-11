import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { authService } from "@/shared/api/services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { type PasswordResetConfirmInput } from "@/shared/schemas/auth";

const PasswordResetConfirm = () => {
  const { uid, token } = useParams() as { uid: string; token: string };
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PasswordResetConfirmInput>({ password: "", confirmpassword: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    setLoading(true);
    try {
      const res = await authService.customer.setPassword({ uid, token, password: data.password });
      if (res.data.status === true) {
        toast.success("Password reset successful! Please login.");
        setTimeout(() => navigate("/login"), 2000);
      } else toast.error(res.data.message || "Password reset failed.");
    } catch {
      toast.error("Invalid or expired link. Please request again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-cream p-5">
      <motion.div
        className="w-full max-w-[420px] bg-white rounded-2xl p-10 text-center shadow-[0_10px_25px_rgba(25,135,84,0.2)] max-md:px-[22px] max-md:py-[35px]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="text-3xl mb-[25px] font-bold text-black max-md:text-2xl">
          Set New Password
        </h3>
        <p className="text-base text-black opacity-80 mb-[30px] leading-[1.5]">
          Enter your new password below.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-[22px]">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              required
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
            />
            <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
              <FaLock /> New Password
            </label>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-black text-xl h-auto w-auto p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </div>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder=" "
              required
              value={formData.confirmpassword || ""}
              onChange={(e) => setFormData({ ...formData, confirmpassword: e.target.value })}
              className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
            />
            <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
              <FaLock /> Confirm Password
            </label>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-black text-xl h-auto w-auto p-0"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </div>
          <Button
            variant="brand"
            type="submit"
            className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-[30px]">
          <Link
            to="/login"
            className="text-brand font-bold underline transition-colors hover:text-brand-action"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordResetConfirm;
