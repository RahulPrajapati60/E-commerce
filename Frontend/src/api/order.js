import axios from "axios"; 

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/v1` 
  : "http://localhost:8000/api/v1";

const BASE = `${API_BASE_URL}/orders`;  

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

export const orderAPI = {
  placeOrder: (body, token) => req("POST", "/place", body, token),

  getMyOrders: (token) => req("GET", "/my-orders", null, token),

  getOrderById: (orderId, token) => req("GET", `/${orderId}`, null, token),

  cancelOrder: (orderId, token) => req("PATCH", `/${orderId}/cancel`, null, token),

  // Admin only
  getAllOrders: (token, params = "") => 
    req("GET", `/admin/all${params ? `?${params}` : ""}`, null, token),

  getStats: (token) => req("GET", "/admin/stats", null, token),

  updateOrderStatus: (orderId, body, token) => 
    req("PATCH", `/admin/${orderId}/status`, body, token),
};
