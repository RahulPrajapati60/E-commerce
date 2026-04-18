import { useEffect, useState } from "react";

const VerifyPage = () => {
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("🔑 Extracted Token:", token);

    if (!token) {
      setStatus("❌ No token found in URL");
      return;
    }

    const verifyUser = async () => {
      try {
        // ✅ Production + Development dono ke liye sahi URL
        const API_URL = process.env.REACT_APP_API_URL 
          ? `${process.env.REACT_APP_API_URL}/api/v1/users/verify`
          : "http://localhost:8000/api/v1/users/verify";

        console.log("📡 Calling API:", API_URL);

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("✅ Verify Response:", data);

        if (data.success || res.ok) {
          setStatus("✅ Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/?page=login";
          }, 2500);
        } else {
          setStatus(`❌ ${data.message || "Verification failed"}`);
        }
      } catch (err) {
        console.error("❌ Verify Error:", err);
        setStatus("❌ Network error. Please try again.");
      }
    };

    verifyUser();
  }, []);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "120px", 
      fontFamily: "sans-serif" 
    }}>
      <h1 style={{ fontSize: "28px", color: "#444" }}>
        {status}
      </h1>
    </div>
  );
};

export default VerifyPage;
