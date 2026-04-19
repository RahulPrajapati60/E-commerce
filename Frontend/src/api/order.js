import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/v1`
  : "https://e-commerce-backend-szgq.onrender.com/api/v1";

const ORDER_BASE = `${API_BASE_URL}/orders`;

console.log("🚀 Order API Base:", ORDER_BASE);

// Axios Instance
const api = axios.create({
  baseURL: ORDER_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto attach token from localStorage 
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed.accessToken || parsed.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error("Token attach error:", err);
  }
  return config;
});

export const orderAPI = {
  // User APIs
  placeOrder: async (body) => {
    const res = await api.post("/place", body);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get("/my-orders");
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await api.get(`/${orderId}`);
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await api.patch(`/${orderId}/cancel`);
    return res.data;
  },

  // Admin APIs
  getAllOrders: async (params = "") => {
    const query = params ? `?${params}` : "";
    const res = await api.get(`/admin/all${query}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  updateOrderStatus: async (orderId, body) => {
    const res = await api.patch(`/admin/${orderId}/status`, body);
    return res.data;
  },
};
