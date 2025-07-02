import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createOrderController,
  getOrderByIdController,
  getOrderByUserController,
  getAllOrdersController,
  updateOrderStatusController,
  deleteOrderController,
} from "../controllers/orderController.js";

const router = express.Router();

// Kullanıcılar: Sipariş oluşturma ve kendi siparişlerini görme
router.post("/", authMiddleware, createOrderController);
router.get("/my-orders", authMiddleware, getOrderByUserController);
router.get("/:id", authMiddleware, getOrderByIdController);

// Admin: Tüm siparişleri görme, durum güncelleme, silme
router.get(
  "/all-orders",
  authMiddleware,
  roleMiddleware("admin"),
  getAllOrdersController
);
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateOrderStatusController
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteOrderController
);

export default router;
