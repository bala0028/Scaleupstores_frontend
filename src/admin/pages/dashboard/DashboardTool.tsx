import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, ShieldCheck } from "lucide-react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import { authService } from "@/shared/api/services";

export const DASHBOARD_TOOL_VERIFIED_KEY = "dashboard_tool_verified_at";
const VERIFIED_WINDOW_MS = 10 * 60 * 1000;

export default function DashboardTool() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async () => {
    setSending(true);
    try {
      const res = await authService.admin.sendDashboardToolOtp();
      const data: any = res.data;
      const newSessionId = data?.data?.session_id || data?.session_id;
      if (!newSessionId) throw new Error("Invalid response from server");
      setSessionId(newSessionId);
      setOtp("");
      toast.success("OTP sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionId || otp.length !== 6) return;

    setVerifying(true);
    try {
      await authService.admin.verifyDashboardToolOtp({ session_id: sessionId, otp });
      sessionStorage.setItem(DASHBOARD_TOOL_VERIFIED_KEY, String(Date.now()));
      toast.success("OTP verified");
      navigate("/dashboard/customization");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Tool</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send a one-time code to unlock dashboard customization.
          </p>
        </div>

        <Card className="p-8 rounded-2xl shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-foreground">Verification required</h3>
              <p className="text-sm text-muted-foreground">
                A one-time code will be emailed for confirmation.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={sending}
            onClick={handleSendOtp}
          >
            <Mail className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : sessionId ? "Resend OTP" : "Send OTP"}
          </Button>

          <form onSubmit={handleVerify} className="mt-6 space-y-2">
            <Label htmlFor="dashboard-tool-otp">Enter OTP</Label>
            <Input
              id="dashboard-tool-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={handleOtpChange}
              disabled={!sessionId || verifying}
              className="text-center text-2xl tracking-[0.4em] font-semibold"
            />
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={!sessionId || otp.length !== 6 || verifying}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
