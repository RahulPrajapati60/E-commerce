import { useEffect, useState } from "react";

const VerifyPage = () => {
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN:", token); // ✅ debug

    if (!token) {
      setStatus("❌ No token found");
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/users/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("VERIFY RESPONSE:", data); 

        if (data.success) {
          setStatus("✅ Email verified successfully");

          //  redirect after success
          setTimeout(() => {
            window.location.href = "/?page=login";
          }, 2000);

        } else {
          setStatus("❌ " + data.message);
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Server error");
      }
    };

    verifyUser();
  }, []);

  return (
    <h1 style={{ textAlign: "center", marginTop: "100px" }}>
      {status}
    </h1>
  );
};

export default VerifyPage;