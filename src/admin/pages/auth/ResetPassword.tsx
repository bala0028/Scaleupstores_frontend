import { useState } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authService } from "@/shared/api/services";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import {
  type AdminResetPasswordInput,
} from "@/shared/schemas/admin-auth";

const ResetPassword = () => {
  const { uid, token } = useParams() as { uid: string; token: string };
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AdminResetPasswordInput>({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    setError("");
    setLoading(true);
    try {
      await authService.admin.setPassword({ uid, token, password: data.password });
      toast.success("Password reset successful!");
      navigate("/auth/sign-in");
    } catch (err: unknown) {
      setError(
        (err instanceof Error ? err.message : "Unknown error") || "Reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <Card className="p-8 w-full max-w-md shadow-lg rounded-2xl">
        <h4 className="text-2xl font-semibold text-foreground text-center mb-6">
          Reset Password 🔐
        </h4>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className={`pr-10 ${error ? "border-destructive" : ""}`}
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              required
              className={error ? "border-destructive" : ""}
              value={formData.confirm || ""}
              onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Back to{" "}
          <Link to="/auth/sign-in" className="text-foreground font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ResetPassword;
