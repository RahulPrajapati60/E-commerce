import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  adminGetAllProducts,
} from "../controllers/Productcontrollers.js";
import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";

const router = express.Router();


router.get("/",                    getAllProducts);         
router.get("/admin/all",           isAuthenticated, isAdmin, adminGetAllProducts);
router.get("/:id",                 getProductById);       
router.post("/:id/review",         isAuthenticated, addReview);

router.post("/",                   isAuthenticated, isAdmin, createProduct);
router.put("/:id",                 isAuthenticated, isAdmin, updateProduct);
router.delete("/:id",              isAuthenticated, isAdmin, deleteProduct);

export default router;