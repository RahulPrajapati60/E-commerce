import { useEffect, useState } from "react";

const VerifyPage = ({ onNavigate, onToast }) => {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("🔑 Extracted Token from URL:", token);

    if (!token) {
      setStatus("❌ No token found in the verification link");
      return;
    }

    const verifyUser = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/api/v1/users/verify`
          : "http://localhost:8000/api/v1/users/verify";

        console.log("📡 Calling Verify API:", API_URL);

        //  Correct Way Token as query parameter 
        const res = await fetch(`${API_URL}?token=${token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("✅ Verify Response from Backend:", data);

        if (data.success || res.ok) {
          setStatus("✅ Email verified successfully! Redirecting to login...");
          if (onToast) onToast("Email verified successfully! 🎉", "success");

          setTimeout(() => {
            window.location.href = "/?page=login";
          }, 2000);
        } else {
          setStatus(`❌ ${data.message || "Verification failed. Link may be expired."}`);
        }
      } catch (err) {
        console.error("❌ Verification Error:", err);
        setStatus("❌ Network error. Please try again or request a new link.");
      }
    };

    verifyUser();
  }, [onToast]);

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
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "900", 
          color: "#444",
          marginBottom: "16px"
        }}>
          {status}
        </h1>
        <p style={{ color: "#666", fontSize: "15px" }}>
          {status.includes("success") 
            ? "You can now login to your account." 
            : "Please wait while we verify your email address..."}
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
