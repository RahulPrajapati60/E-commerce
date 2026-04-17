import { useState } from "react";
import { authAPI } from "../api/auth";
import { useApiCall } from "../hooks/useApiCall";
import Input from "../components/Input";
import Button from "../components/Button";

const RegisterPage = ({ onNavigate, onToast }) => {
  const { loading, error, call, setError } = useApiCall();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
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

    const result = await call(() =>
      authAPI.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password, 
      })
    );

    if (result?.success) {
      setSuccess(true);
      onToast("Registration successful! Please verify your email.", "success");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2">Check your inbox</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            We've sent a verification link to <strong className="text-stone-700">{form.email}</strong>.
            Please verify before logging in.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => onNavigate("login")} className="w-full">
              Go to Sign In
            </Button>
            <Button variant="outline" onClick={() => onNavigate("reverify")} className="w-full">
              Resend verification email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/40 rounded-full"
              style={{
                width: `${180 + i * 80}px`,
                height: `${180 + i * 80}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
            <span className="text-white font-black text-2xl">ऊ</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            India's finest<br />
            <span className="text-amber-200">crafted for you</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Join millions of Indians discovering authentic handcrafted goods, premium textiles, and timeless jewellery.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { n: "2M+", l: "Happy Customers" },
            { n: "50K+", l: "Products" },
            { n: "500+", l: "Artisans" },
            { n: "4.9★", l: "Average Rating" },
          ].map((s) => (
            <div key={s.n} className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-white font-black text-xl">{s.n}</p>
              <p className="text-white/60 text-xs">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">ऊ</span>
            </div>
            <span className="font-black text-stone-900 text-xl">Utsav<span className="font-light text-amber-600">.in</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-stone-900 mb-1">Create account</h2>
            <p className="text-stone-500 text-sm">
              Already registered?{" "}
              <button onClick={() => onNavigate("login")} className="text-amber-600 font-semibold hover:text-amber-700">
                Sign in
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                name="firstName"
                placeholder="Rahul"
                value={form.firstName}
                onChange={handleChange}
                error={fieldErrors.firstName}
              />
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Prajapati"
                value={form.lastName}
                onChange={handleChange}
                error={fieldErrors.lastName}
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />

            <p className="text-xs text-stone-400">
              By registering you agree to our{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">Terms of Service</span> &{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <Button loading={loading} onClick={handleSubmit} className="w-full mt-2">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
