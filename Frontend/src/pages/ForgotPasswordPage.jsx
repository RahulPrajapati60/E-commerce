import { useState } from "react";
import { authAPI } from "../api/auth";
import { useApiCall } from "../hooks/useApiCall";
import Input from "../components/Input";
import Button from "../components/Button";

const STEPS = { EMAIL: "email", OTP: "otp", PASSWORD: "password", DONE: "done" };

const ForgotPasswordPage = ({ onNavigate, onToast }) => {
  const { loading, error, call, setError } = useApiCall();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [fieldError, setFieldError] = useState("");

  const handleSendOTP = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Enter a valid email address");
      return;
    }
    const result = await call(() => authAPI.forgotPassword({ email }));
    if (result?.success) {
      onToast("OTP sent to your email!", "success");
      setStep(STEPS.OTP);
    }
  };

  const handleVerifyOTP = async () => {
  if (!otp || otp.length !== 6) {
    setFieldError("Enter the 6-digit OTP");
    return;
  }
  const result = await call(() => authAPI.verifyOTP({ 
    email: email, 
    otp: otp 
  }));
  if (result?.success) {
    onToast("OTP verified!", "success");
    setStep(STEPS.PASSWORD);
  }
};

  const handleChangePassword = async () => {
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      setFieldError("Password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }
    const result = await call(() =>
      authAPI.changePassword(email, {
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      })
    );
    if (result?.success) {
      setStep(STEPS.DONE);
    }
  };

  const stepMeta = {
    [STEPS.EMAIL]: { title: "Forgot password?", subtitle: "Enter your email to receive a reset OTP.", progress: 33 },
    [STEPS.OTP]:   { title: "Enter OTP", subtitle: `We've sent a 6-digit code to ${email}.`, progress: 66 },
    [STEPS.PASSWORD]: { title: "New password", subtitle: "Choose a strong password.", progress: 90 },
  };

  const meta = stepMeta[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate("login")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </button>

        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/60 p-8 border border-amber-50">
          {step !== STEPS.DONE && (
            <div className="mb-7">
              {/* Progress bar */}
              <div className="h-1 bg-stone-100 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${meta.progress}%` }}
                />
              </div>
              <h2 className="text-2xl font-black text-stone-900 mb-1">{meta.title}</h2>
              <p className="text-stone-500 text-sm">{meta.subtitle}</p>
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {step === STEPS.EMAIL && (
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(""); setError(null); }}
                error={fieldError}
              />
              <Button loading={loading} onClick={handleSendOTP} className="w-full">
                Send OTP
              </Button>
            </div>
          )}

          {step === STEPS.OTP && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-amber-700/80 mb-3">
                  6-Digit OTP
                </label>
                <input
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setFieldError(""); setError(null); }}
                  placeholder="_ _ _ _ _ _"
                  className="w-full text-center text-3xl font-black tracking-[0.8em] border border-amber-200 rounded-xl py-4 bg-amber-50/60 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                {fieldError && <p className="mt-1.5 text-xs text-red-500 font-medium">{fieldError}</p>}
              </div>
              <Button loading={loading} onClick={handleVerifyOTP} className="w-full">
                Verify OTP
              </Button>
              <button
                onClick={() => { setOtp(""); handleSendOTP(); }}
                className="w-full text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === STEPS.PASSWORD && (
            <div className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                value={passwords.newPassword}
                onChange={(e) => { setPasswords((p) => ({ ...p, newPassword: e.target.value })); setFieldError(""); setError(null); }}
                error={passwords.newPassword && passwords.newPassword.length < 6 ? "Too short" : ""}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => { setPasswords((p) => ({ ...p, confirmPassword: e.target.value })); setFieldError(""); setError(null); }}
                error={fieldError}
              />
              <Button loading={loading} onClick={handleChangePassword} className="w-full">
                Reset Password
              </Button>
            </div>
          )}

          {step === STEPS.DONE && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-stone-900 mb-2">Password reset!</h2>
              <p className="text-stone-500 text-sm mb-6">Your password has been updated successfully.</p>
              <Button onClick={() => onNavigate("login")} className="w-full">
                Sign In Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
