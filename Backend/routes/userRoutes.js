import express from "express";
import {
  allUser,
  changePassword,
  forgotPassword,
  getUserById,
  login,
  logout,
  register,
  reVerify,
  verify,
  verifyOTP,
} from "../controllers/userControllers.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/reverify", reVerify);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.post("/forgot-password", forgotPassword);
router.get("/verify", verify);
router.post("/verify", verify);
router.post("/change-password/:email", changePassword);
router.get("/all-user", isAuthenticated, allUser);
router.get("/get-user/:userId", getUserById);

export default router;
