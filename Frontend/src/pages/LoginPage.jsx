import { useState, useEffect } from "react";
import { authAPI } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useApiCall } from "../hooks/useApiCall";
import Input from "../components/Input";
import Button from "../components/Button";

const LoginPage = ({ onNavigate, onToast }) => {
  const { login } = useAuth();
  const { loading, error, call, setError } = useApiCall();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});


  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get("redirect") || "home";

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };
  
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setError(null);
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    const result = await call(() => authAPI.login(form));
    if (result?.success) {
      login({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      onToast(`Welcome back, ${result.user.firstName}! 🎉`, "success");

      //  Smart Redirect
      onNavigate(redirectTo);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex items-center gap-2.5 group mx-auto"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform mx-auto">
              <span className="text-white font-black text-2xl leading-none">ऊ</span>
            </div>
          </button>
          <h1 className="font-black text-stone-900 text-2xl mt-3">
            Utsav<span className="font-light text-amber-600">.in</span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/60 p-8 border border-amber-50">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-stone-900 mb-1">Welcome back</h2>
            <p className="text-stone-500 text-sm">
              New here?{" "}
              <button
                onClick={() => onNavigate("register")}
                className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              error={fieldErrors.email}
            />
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                error={fieldErrors.password}
              />
              <div className="mt-2 text-right">
                <button
                  onClick={() => onNavigate("forgot-password")}
                  className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button loading={loading} onClick={handleSubmit} className="w-full">
              Sign In
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-stone-400">or continue with</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("reverify")}
              className="w-full py-3 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium hover:bg-amber-50 transition-colors"
            >
              Resend Verification Email
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Protected by TLS encryption · Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;