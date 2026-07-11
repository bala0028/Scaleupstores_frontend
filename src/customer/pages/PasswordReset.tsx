import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/shared/api/services";
import { FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { type PasswordResetInput } from "@/shared/schemas/auth";

const PasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PasswordResetInput>({} as PasswordResetInput);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    setLoading(true);
    try {
      const res = await authService.customer.forgotPassword(data.email);
      if (res.data.status === true) {
        toast.success("Password reset link sent to your email!");
        setTimeout(() => navigate("/login"), 2500);
      } else toast.error(res.data.message || "Failed to send reset link.");
    } catch {
      toast.error("Something went wrong. Please try again.");
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
          Forgot Your Password?
        </h3>
        <p className="text-base text-black opacity-80 mb-[30px] leading-[1.5]">
          No worries! Enter your registered email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-[22px]">
          <div className="relative">
            <Input
              type="email"
              placeholder=" "
              required
              value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full py-[14px] pr-[14px] pl-[42px] text-lg rounded-xl border-[1.5px] border-brand-border-light bg-brand-cream text-black font-semibold outline-none transition-all focus:border-brand focus:shadow-[0_0_10px_rgba(25,135,84,0.3)] placeholder:text-transparent peer"
            />
            <label className="absolute left-[42px] top-1/2 -translate-y-1/2 pointer-events-none text-black font-semibold transition-all flex items-center gap-2 peer-focus:top-[5px] peer-focus:text-sm peer-focus:text-brand peer-focus:bg-brand-cream peer-focus:px-2 peer-focus:rounded-lg peer-focus:left-[15px] peer-[:not(:placeholder-shown)]:top-[5px] peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:bg-brand-cream peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded-lg peer-[:not(:placeholder-shown)]:left-[15px]">
              <FaEnvelope /> Email
            </label>
          </div>
          <Button
            variant="brand"
            type="submit"
            className="rounded-pill py-[14px] font-bold text-xl max-md:text-base max-md:py-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default PasswordReset;
