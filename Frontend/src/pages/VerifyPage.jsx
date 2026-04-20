import { useEffect, useState } from "react";

const VerifyPage = ({ onNavigate, onToast }) => {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "success") {
      setStatus("✅ Email verified successfully! Redirecting to login...");
      if (onToast) onToast("Email verified successfully! 🎉", "success");
      setTimeout(() => {
        onNavigate("login");
      }, 1500);
    } else {
      setStatus("❌ Something went wrong. Please try again or request new link.");
    }
  }, [onNavigate, onToast]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafaf9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#444", marginBottom: "16px" }}>
          {status}
        </h1>
      </div>
    </div>
  );
};

export default VerifyPage;
