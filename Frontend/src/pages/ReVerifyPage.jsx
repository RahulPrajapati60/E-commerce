import { useState } from "react";
import { authAPI } from "../api/auth";
import { useApiCall } from "../hooks/useApiCall";
import Input from "../components/Input";
import Button from "../components/Button";

const ReVerifyPage = ({ onNavigate, onToast }) => {
  const { loading, error, call, setError } = useApiCall();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [done, setDone] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await call(() => authAPI.reVerify({ email }));
    if (result?.success) {
      setDone(true);
      onToast("Verification link sent to your email!", "success");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back button */}
        <button
          onClick={() => onNavigate("login")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </button>

        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/60 p-8 border border-amber-50">
          {!done ? (
            <>
              {/* Icon + heading */}
              <div className="mb-7">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-amber-600"
                    fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-stone-900 mb-1">
                  Resend verification link
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Enter your registered email and we'll send you a{" "}
                  <span className="font-semibold text-stone-700">one-click verification link</span>.
                  Just open it in your browser — no code needed.
                </p>
              </div>

              {/* How it works */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 space-y-2.5">
                {[
                  { step: "1", text: "Enter your email below and click Send" },
                  { step: "2", text: "Open the email we send you" },
                  { step: "3", text: "Click the verification link inside — done!" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center flex-shrink-0">
                      {step}
                    </span>
                    <p className="text-xs text-stone-600">{text}</p>
                  </div>
                ))}
              </div>

              {/* API error */}
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  error={emailError}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <Button loading={loading} onClick={handleSubmit} className="w-full">
                  Send Verification Link
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-stone-400">
                The link expires in{" "}
                <span className="font-semibold text-stone-500">10 minutes</span>
              </p>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-2">
              {/* Animated envelope */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-amber-500"
                    fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                {/* Green tick badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-black text-stone-900 mb-2">Link sent!</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-1">
                We've sent a verification link to
              </p>
              <p className="font-bold text-stone-800 text-sm mb-6">{email}</p>

              {/* What to do next */}
              <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 mb-6 text-left space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  What to do next
                </p>
                {[
                  "Open your email inbox",
                  "Find the email from Utsav.in",
                  "Click the 'Verify Email' button inside",
                  "You'll be verified instantly — then login!",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-stone-600">{step}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button onClick={() => onNavigate("login")} className="w-full">
                  Go to Sign In
                </Button>
                {/* Allow resend */}
                <button
                  onClick={() => { setDone(false); setEmail(""); }}
                  className="w-full text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors py-2"
                >
                  Use a different email
                </button>
              </div>

              <p className="mt-4 text-xs text-stone-400">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setDone(false); }}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReVerifyPage;