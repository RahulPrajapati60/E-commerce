import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1/products";

const req = async (method, path, body, token) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const productAPI = {
  getAll: async (query = "") => {
    const res = await axios.get(`${API_BASE}${query}`);
    return res.data;
  },

 
  getById: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  },

 
  addReview: (id, body, token) =>
    req("POST", `/products/${id}/review`, body, token),

  // ADMIN
  create: (body, token) =>
    req("POST", `/products`, body, token),

  update: (id, body, token) =>
    req("PUT", `/products/${id}`, body, token),

  remove: (id, token) =>
    req("DELETE", `/products/${id}`, null, token),

  adminAll: (params = "", token) =>
    req("GET", `/products/admin/all${params ? `?${params}` : ""}`, null, token),
};