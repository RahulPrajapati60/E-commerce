import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/v1`
  : "http://localhost:8000/api/v1";

const PRODUCT_BASE = `${API_BASE_URL}/products`;

console.log("🚀 Product API Base:", PRODUCT_BASE); // For debugging

// Create axios instance (Recommended)
const api = axios.create({
  baseURL: PRODUCT_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request automatically (if available)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or your token storage method
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productAPI = {
  // Public APIs
  getAll: async (query = "?sort=newest&page=1&limit=12") => {
    const res = await api.get(query);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  // Review
  addReview: async (id, body, token) => {
    const res = await api.post(`/${id}/review`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ADMIN APIs
  create: async (body, token) => {
    const res = await api.post("/", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  update: async (id, body, token) => {
    const res = await api.put(`/${id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  remove: async (id, token) => {
    const res = await api.delete(`/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  adminAll: async (params = "", token) => {
    const query = params ? `?${params}` : "";
    const res = await api.get(`/admin/all${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
