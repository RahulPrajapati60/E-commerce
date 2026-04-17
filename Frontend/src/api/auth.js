const BASE = "http://localhost:8000/api/v1/users";

const req = async (method, path, body, token) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();

  console.log("API RESPONSE:", data);
  
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const authAPI = {
  register:        (body)              => req("POST", "/register", body),
  login:           (body)              => req("POST", "/login", body),
  logout:          (token)             => req("POST", "/logout", null, token),
  reVerify:        (body)              => req("POST", "/reverify", body),
  forgotPassword:  (body)              => req("POST", "/forgot-password", body),

  verifyOTP:       (body)              => req("POST", "/verify-otp", body),
  
  changePassword:  (email, body)       => req("POST", `/change-password/${email}`, body),
  getAllUsers:      (token)            => req("GET",  "/all-user", null, token),
  getUserById:     (userId)            => req("GET",  `/get-user/${userId}`),
};
