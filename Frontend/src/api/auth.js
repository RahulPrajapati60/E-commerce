// src/api/config.js

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/v1` 
  : "https://e-commerce-backend-szgq.onrender.com/api/v1";

console.log("🚀 API Base URL:", API_BASE_URL);   // Helpful for debugging

const req = async (method, endpoint, body = null, token = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    console.log(`📡 [${method}] ${endpoint} →`, data);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error:", error.message);
    throw error;
  }
};

// Base URLs
const USER_BASE = `${API_BASE_URL}/users`;
const PRODUCT_BASE = `${API_BASE_URL}/products`;

export const authAPI = {
  register: (body) => req("POST", `${USER_BASE}/register`, body),
  login: (body) => req("POST", `${USER_BASE}/login`, body),
  logout: (token) => req("POST", `${USER_BASE}/logout`, null, token),
  reVerify: (body) => req("POST", `${USER_BASE}/reverify`, body),
  forgotPassword: (body) => req("POST", `${USER_BASE}/forgot-password`, body),
  verifyOTP: (body) => req("POST", `${USER_BASE}/verify-otp`, body),
  changePassword: (email, body) => req("POST", `${USER_BASE}/change-password/${email}`, body),
  getAllUsers: (token) => req("GET", `${USER_BASE}/all-user`, null, token),
  getUserById: (userId, token) => req("GET", `${USER_BASE}/get-user/${userId}`, null, token),
};

// Products API
export const productAPI = {
  getAll: (params = "?sort=newest&page=1&limit=12") =>
    req("GET", `${PRODUCT_BASE}${params}`),

  getById: (id) => req("GET", `${PRODUCT_BASE}/${id}`),

  // Add more as needed
  create: (body, token) => req("POST", PRODUCT_BASE, body, token),
  update: (id, body, token) => req("PUT", `${PRODUCT_BASE}/${id}`, body, token),
  delete: (id, token) => req("DELETE", `${PRODUCT_BASE}/${id}`, null, token),
};
