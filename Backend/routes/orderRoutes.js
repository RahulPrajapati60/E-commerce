import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from "../controllers/Ordercontrollers.js";

import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";

const router = express.Router();


router.post("/place", isAuthenticated, placeOrder);

router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/:orderId", isAuthenticated, getOrderById);
router.patch("/:orderId/cancel", isAuthenticated, cancelOrder);

// Admin
router.get("/admin/stats", isAuthenticated, isAdmin, getOrderStats);
router.get("/admin/all", isAuthenticated, isAdmin, getAllOrders);
router.patch("/admin/:orderId/status", isAuthenticated, isAdmin, updateOrderStatus);

export default router;