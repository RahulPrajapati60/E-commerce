import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';  

const VerifyPage = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyUser = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_SERVER_URL || "https://e-commerce-backend-szgq.onrender.com";
        
        const res = await fetch(`${BACKEND_URL}/api/v1/users/verify?token=${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 3000); // redirect after success
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    verifyUser();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      {status === 'verifying' && <h2>Verifying your email...</h2>}
      {status === 'success' && (
        <>
          <h2 style={{ color: 'green' }}>✅ Email Verified Successfully!</h2>
          <p>You can now login to your account.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 style={{ color: 'red' }}>❌ Verification Failed</h2>
          <p>Invalid or expired token. Please request a new verification email.</p>
        </>
      )}
    </div>
  );
};

export default VerifyPage;
