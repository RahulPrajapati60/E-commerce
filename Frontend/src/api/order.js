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

// Auto attach token (Recommended)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Change if you use different storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderAPI = {
  // User APIs
  placeOrder: async (body, token) => {
    const res = await api.post("/place", body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },

  getMyOrders: async (token) => {
    const res = await api.get("/my-orders");
    return res.data;
  },

  getOrderById: async (orderId, token) => {
    const res = await api.get(`/${orderId}`);
    return res.data;
  },

  cancelOrder: async (orderId, token) => {
    const res = await api.patch(`/${orderId}/cancel`);
    return res.data;
  },

  // Admin APIs
  getAllOrders: async (params = "", token) => {
    const query = params ? `?${params}` : "";
    const res = await api.get(`/admin/all${query}`);
    return res.data;
  },

  getStats: async (token) => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  updateOrderStatus: async (orderId, body, token) => {
    const res = await api.patch(`/admin/${orderId}/status`, body);
    return res.data;
  },
};
