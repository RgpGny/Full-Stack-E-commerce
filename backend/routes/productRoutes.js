import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateProduct } from "../middleware/validationMiddleware.js";
import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/productController.js";

const router = express.Router();

// Tüm kullanıcılar ürünleri görebilir
router.get("/", getAllProductsHandler);
router.get("/:id", getProductByIdHandler);

// Yalnızca admin'ler ürün ekleyebilir, güncelleyebilir, silebilir
router.post("/", authMiddleware, roleMiddleware("admin"), validateProduct, createProductHandler);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateProduct,
  updateProductHandler
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProductHandler
);

export default router;
